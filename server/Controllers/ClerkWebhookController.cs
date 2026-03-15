using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using System.Net;
using Svix;
using Svix.Exceptions;

namespace DiffDetector.Api.Controllers;

[ApiController]
[Route("api/webhooks/clerk")]
public class ClerkWebhookController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public ClerkWebhookController(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    [HttpPost]
    public async Task<IActionResult> Handle()
    {
        var webhookSecret = _config["Clerk:WebhookSecret"];
        if (string.IsNullOrEmpty(webhookSecret))
        {
            return StatusCode(500, "Server Configuration Error: Webhook secret missing.");
        }

        var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();

        var headers = new WebHeaderCollection();
        foreach (var header in Request.Headers)
        {
            headers.Add(header.Key, header.Value.ToString());
        }

        try
        {
            var webhook = new Webhook(webhookSecret);
            webhook.Verify(json, headers); 
        }
        catch (WebhookVerificationException)
        {
            return BadRequest("Invalid Svix signature.");
        }

        var payload = JsonDocument.Parse(json);
        var eventType = payload.RootElement.GetProperty("type").GetString();
        var data = payload.RootElement.GetProperty("data");

        if (eventType == "user.created")
        {
            var newUser = new User 
            {
                ClerkUserId = data.GetProperty("id").GetString()!,
                Email = data.GetProperty("email_addresses")[0].GetProperty("email_address").GetString()!,
                FirstName = data.TryGetProperty("first_name", out var fn) ? fn.GetString() ?? "" : "",
                LastName = data.TryGetProperty("last_name", out var ln) ? ln.GetString() ?? "" : ""
            };
            _db.Users.Add(newUser);
        }

        if (eventType == "organization.created")
        {
            var newOrg = new Organization
            {
                ClerkOrgId = data.GetProperty("id").GetString()!,
                Name = data.GetProperty("name").GetString()!
            };
            _db.Organizations.Add(newOrg);
        }

        if (eventType == "organizationMembership.created")
        {
            var clerkUserId = data.GetProperty("public_user_data").GetProperty("user_id").GetString()!;
            var clerkOrgId = data.GetProperty("organization").GetProperty("id").GetString()!;
            var role = data.GetProperty("role").GetString()!;

            var user = _db.Users.FirstOrDefault(u => u.ClerkUserId == clerkUserId);
            var org = _db.Organizations.FirstOrDefault(o => o.ClerkOrgId == clerkOrgId);

            if (user == null || org == null)
            {
                return Conflict("Race condition: User or Org not in database yet. Clerk, please retry.");
            }

            var existingMembership = _db.OrganizationUsers
                .FirstOrDefault(ou => ou.UserId == user.Id && ou.OrganizationId == org.Id);
                
            if (existingMembership == null) 
            {
                var membership = new OrganizationUser
                {
                    UserId = user.Id,
                    OrganizationId = org.Id,
                    Role = role
                };
                _db.OrganizationUsers.Add(membership);
            }
        }

        if (eventType == "subscription.created" || eventType == "subscription.updated")
        {
            if (!data.TryGetProperty("payer", out var payerElement) || 
                !payerElement.TryGetProperty("organization_id", out var orgIdElement))
            {
                return Ok(); 
            }

            var clerkOrgId = orgIdElement.GetString();
            var org = _db.Organizations.FirstOrDefault(o => o.ClerkOrgId == clerkOrgId);

            if (org == null)
            {
                return Conflict("Race condition: Organization not in database yet. Clerk, please retry.");
            }

            if (data.TryGetProperty("status", out var statusElement))
            {
                var status = statusElement.GetString();
                org.IsSubscriptionActive = status == "active" || status == "trialing";
            }

            if (data.TryGetProperty("items", out var itemsElement) && itemsElement.ValueKind == JsonValueKind.Array)
            {
                foreach (var item in itemsElement.EnumerateArray())
                {
                    var itemStatus = item.GetProperty("status").GetString();
                    
                    if (itemStatus == "active" || itemStatus == "canceled") 
                    {
                        var slug = item.GetProperty("plan").GetProperty("slug").GetString();
                        if (!string.IsNullOrEmpty(slug))
                        {
                            org.SubscriptionPlan = slug;
                            break; 
                        }
                    }
                }
            }
        }

        if (eventType == "subscription.deleted")
        {
            if (!data.TryGetProperty("payer", out var payerElement) || 
                !payerElement.TryGetProperty("organization_id", out var orgIdElement))
            {
                return Ok(); 
            }

            var clerkOrgId = orgIdElement.GetString();
            var org = _db.Organizations.FirstOrDefault(o => o.ClerkOrgId == clerkOrgId);

            if (org != null)
            {
                org.IsSubscriptionActive = false;
                org.SubscriptionPlan = "free";
            }
        }

        await _db.SaveChangesAsync();
        
        return Ok(); 
    }
}