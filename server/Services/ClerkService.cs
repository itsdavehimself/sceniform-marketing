using System.Net.Http.Headers;

namespace DiffDetector.Api.Services;

public class ClerkService
{
    private readonly HttpClient _httpClient;
    private readonly string _clerkSecretKey;

    public ClerkService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        
        _clerkSecretKey = config["Clerk:SecretKey"] 
            ?? throw new InvalidOperationException("Clerk SecretKey missing");
            
        _httpClient.BaseAddress = new Uri("https://api.clerk.com/v1/");
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", _clerkSecretKey);
    }

    public async Task DeleteUserAsync(string clerkUserId)
    {
        var response = await _httpClient.DeleteAsync($"users/{clerkUserId}");
        
        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Failed to delete user from Clerk: {error}");
        }
    }

    public async Task DeleteOrganizationAsync(string clerkOrgId)
    {
        var response = await _httpClient.DeleteAsync($"organizations/{clerkOrgId}");
        
        if (!response.IsSuccessStatusCode && response.StatusCode != System.Net.HttpStatusCode.NotFound)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Failed to delete organization from Clerk: {error}");
        }
    }
}