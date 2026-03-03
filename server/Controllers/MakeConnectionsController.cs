using DiffDetector.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.Http.Headers;

namespace DiffDetector.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class MakeConnectionsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly EncryptionService _encryption;
    private readonly HttpClient _httpClient;

    public MakeConnectionsController(AppDbContext db, EncryptionService encryption, HttpClient httpClient)
    {
        _db = db;
        _encryption = encryption;
        _httpClient = httpClient;
    }

    public class CreateConnectionRequest
    {
        public string ApiKey { get; set; } = string.Empty;
        public string Label { get; set; } = "My Make Connection";
        public string Zone { get; set; } = "us1";
    }

    [HttpPost]
    public async Task<IActionResult> AddConnection([FromBody] CreateConnectionRequest request)
    {
        var clerkUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(clerkUserId)) return Unauthorized("Invalid token.");

        var user = await _db.Users
            .Include(u => u.OrganizationMemberships)
            .FirstOrDefaultAsync(u => u.ClerkUserId == clerkUserId);

        if (user == null || !user.OrganizationMemberships.Any())
            return BadRequest("User not found or does not belong to an organization.");

        var orgId = user.OrganizationMemberships.First().OrganizationId;

        var requestMessage = new HttpRequestMessage(HttpMethod.Get, $"https://{request.Zone.ToLower()}.make.com/api/v2/organizations");
        requestMessage.Headers.Authorization = new AuthenticationHeaderValue("Token", request.ApiKey);
        
        var makeResponse = await _httpClient.SendAsync(requestMessage);
        if (!makeResponse.IsSuccessStatusCode)
        {
            return BadRequest("Make.com rejected this API key. Please check your token and Home Zone.");
        }

        var encryptedKey = _encryption.Encrypt(request.ApiKey);

        var connection = new MakeConnection
        {
            OrganizationId = orgId,
            AddedByUserId = user.Id,
            Label = request.Label,
            EncryptedApiKey = encryptedKey,
            Zone = request.Zone.ToLower()
        };

        _db.MakeConnections.Add(connection);
        await _db.SaveChangesAsync();

        return Ok(new { Message = "Connection verified and saved securely." });
    }

    [HttpGet("status")]
    public async Task<IActionResult> CheckStatus()
    {
        var clerkUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(clerkUserId)) return Unauthorized();

        var user = await _db.Users
            .Include(u => u.OrganizationMemberships)
            .FirstOrDefaultAsync(u => u.ClerkUserId == clerkUserId);

        if (user == null || !user.OrganizationMemberships.Any())
            return Ok(new { hasConnection = false });

        var orgId = user.OrganizationMemberships.First().OrganizationId;

        var hasConnection = await _db.MakeConnections.AnyAsync(c => c.OrganizationId == orgId);

        return Ok(new { hasConnection });
    }

    [HttpGet("organizations")]
    public async Task<IActionResult> GetOrganizations([FromServices] MakeService makeService)
    {
        try
        {
            var rawJson = await makeService.GetOrganizationsAsync();
            return Content(rawJson, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("teams")]
    public async Task<IActionResult> GetTeams([FromQuery] int organizationId, [FromQuery] string zone, [FromServices] MakeService makeService)
    {
        try
        {
            var rawJson = await makeService.GetTeamsAsync(organizationId, zone);
            return Content(rawJson, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}