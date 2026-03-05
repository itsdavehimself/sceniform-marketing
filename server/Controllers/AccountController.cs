using DiffDetector.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DiffDetector.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AccountController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ClerkService _clerkService;

    public AccountController(AppDbContext db, ClerkService clerkService)
    {
        _db = db;
        _clerkService = clerkService;
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteAccount()
    {
        var clerkUserId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(clerkUserId)) return Unauthorized();

        var user = await _db.Users
            .Include(u => u.OrganizationMemberships)
            .FirstOrDefaultAsync(u => u.ClerkUserId == clerkUserId);

        if (user == null) return NotFound("User not found.");

        var orgIdsToCheck = user.OrganizationMemberships.Select(m => m.OrganizationId).ToList();

        foreach (var orgId in orgIdsToCheck)
        {
            var otherMembers = await _db.OrganizationUsers
                .Where(m => m.OrganizationId == orgId && m.UserId != user.Id)
                .Select(m => m.UserId)
                .ToListAsync();

           if (!otherMembers.Any())
            {
                var org = await _db.Organizations.FindAsync(orgId);
                if (org != null)
                {
                    var clerkOrgIdToNuke = org.ClerkOrgId;
                    
                    _db.Organizations.Remove(org);      
                    
                    if (!string.IsNullOrEmpty(clerkOrgIdToNuke))
                    {
                        await _clerkService.DeleteOrganizationAsync(clerkOrgIdToNuke);
                    }
                }
            }
            else
            {
                var nextAdminId = otherMembers.First();
                
                var orphanedConnections = await _db.MakeConnections
                    .Where(c => c.OrganizationId == orgId && c.AddedByUserId == user.Id)
                    .ToListAsync();

                foreach (var conn in orphanedConnections)
                {
                    conn.AddedByUserId = nextAdminId;
                }
            }
        }
        
        await _db.SaveChangesAsync();

        _db.Users.Remove(user);
        await _db.SaveChangesAsync();

        await _clerkService.DeleteUserAsync(clerkUserId);

        return Ok(new { message = "Account and associated data deleted successfully." });
    }
}