using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;

namespace DiffDetector.Api.Services;

public class MakeService
{
    private readonly HttpClient _httpClient;
    private readonly AppDbContext _db;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly EncryptionService _encryption;

    public MakeService(
        HttpClient httpClient, 
        AppDbContext db, 
        IHttpContextAccessor httpContextAccessor, 
        EncryptionService encryption)
    {
        _httpClient = httpClient;
        _db = db;
        _httpContextAccessor = httpContextAccessor;
        _encryption = encryption;
        
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "Difflow-App");
    }

    // THE ENGINE: Grabs the active user's key and decrypts it on the fly
    private async Task<(string ApiKey, string HomeZone)> GetConnectionDetailsAsync()
    {
        var clerkUserId = _httpContextAccessor.HttpContext?.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(clerkUserId)) throw new UnauthorizedAccessException("Missing Clerk Token");

        var user = await _db.Users
            .Include(u => u.OrganizationMemberships)
            .FirstOrDefaultAsync(u => u.ClerkUserId == clerkUserId);

        var orgId = user?.OrganizationMemberships.FirstOrDefault()?.OrganizationId 
            ?? throw new Exception("User is not in an organization.");

        var connection = await _db.MakeConnections.FirstOrDefaultAsync(c => c.OrganizationId == orgId) 
            ?? throw new Exception("No Make.com connection found in vault.");

        var apiKey = _encryption.Decrypt(connection.EncryptedApiKey);
        return (apiKey, connection.Zone);
    }

    // 1. GET ORGANIZATIONS (Uses the Home Zone)
    public async Task<string> GetOrganizationsAsync()
    {
        var (apiKey, homeZone) = await GetConnectionDetailsAsync();

        var request = new HttpRequestMessage(HttpMethod.Get, $"https://{homeZone}.make.com/api/v2/organizations");
        request.Headers.Authorization = new AuthenticationHeaderValue("Token", apiKey);

        var response = await _httpClient.SendAsync(request);
        
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Make API failed: {response.StatusCode} - {error}");
        }

        return await response.Content.ReadAsStringAsync();
    }

    // 2. GET TEAMS (Uses the Organization's specific Zone)
    public async Task<string> GetTeamsAsync(int organizationId, string targetZone)
    {
        var (apiKey, _) = await GetConnectionDetailsAsync();

        var request = new HttpRequestMessage(HttpMethod.Get, $"https://{targetZone}/api/v2/teams?organizationId={organizationId}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Token", apiKey);

        var response = await _httpClient.SendAsync(request);
        
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Make API failed: {response.StatusCode} - {error}");
        }

        return await response.Content.ReadAsStringAsync();
    }

    // 3. GET SCENARIOS
    public async Task<string> GetScenariosAsync(int teamId, string targetZone)
    {
        var (apiKey, _) = await GetConnectionDetailsAsync();

        var request = new HttpRequestMessage(HttpMethod.Get, $"https://{targetZone}/api/v2/scenarios?teamId={teamId}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Token", apiKey);

        var response = await _httpClient.SendAsync(request);
        
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Make API failed: {response.StatusCode} - {error}");
        }

        return await response.Content.ReadAsStringAsync();
    }

    // 4. GET FOLDERS
    public async Task<string> GetFoldersAsync(int teamId, string targetZone)
    {
        var (apiKey, _) = await GetConnectionDetailsAsync();

        var request = new HttpRequestMessage(HttpMethod.Get, $"https://{targetZone}/api/v2/scenarios-folders?teamId={teamId}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Token", apiKey);

        var response = await _httpClient.SendAsync(request);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Make API failed: {response.StatusCode} - {error}");
        }

        return await response.Content.ReadAsStringAsync();
    }

    // 5. GET BLUEPRINT
    public async Task<string> GetBlueprintAsync(int scenarioId, string targetZone)
    {
        var (apiKey, _) = await GetConnectionDetailsAsync();

        var request = new HttpRequestMessage(HttpMethod.Get, $"https://{targetZone}/api/v2/scenarios/{scenarioId}/blueprint");
        request.Headers.Authorization = new AuthenticationHeaderValue("Token", apiKey);

        var response = await _httpClient.SendAsync(request);
        
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Make API Blueprint failed: {response.StatusCode} - {errorBody}");
        }

        return await response.Content.ReadAsStringAsync();
    }

    // 6. PATCH SCENARIO
    public async Task<string> PatchScenarioAsync(int scenarioId, string targetZone, object updateData)
    {        
        var (apiKey, _) = await GetConnectionDetailsAsync();

        var request = new HttpRequestMessage(HttpMethod.Patch, $"https://{targetZone}/api/v2/scenarios/{scenarioId}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Token", apiKey);
        
        var jsonPayload = JsonSerializer.Serialize(updateData);
        request.Content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        var response = await _httpClient.SendAsync(request);
        
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Make API failed: {response.StatusCode} - {error}");
        }

        return await response.Content.ReadAsStringAsync();
    }

    // 7. GET CONNECTIONS
    public async Task<string> GetConnectionsAsync(int teamId, string targetZone)
    {
        var (apiKey, _) = await GetConnectionDetailsAsync();

        var request = new HttpRequestMessage(HttpMethod.Get, $"https://{targetZone}/api/v2/connections?teamId={teamId}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Token", apiKey);

        var response = await _httpClient.SendAsync(request);
        
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Make API failed: {response.StatusCode} - {errorBody}");
        }

        return await response.Content.ReadAsStringAsync();
    }
}