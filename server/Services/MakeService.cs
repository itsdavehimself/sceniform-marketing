using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace DiffDetector.Api.Services;

public class MakeService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;

    public MakeService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _config = config;

        var apiKey = _config["MakeApi:Key"];
        var baseUrl = _config["MakeApi:BaseUrl"] ?? "https://us1.make.com/api/v2/";

        _httpClient.BaseAddress = new Uri(baseUrl);
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Token", apiKey);
        _httpClient.DefaultRequestHeaders.Add("User-Agent", "DiffDetector-App");
    }

    public async Task<string> GetScenariosAsync()
    {
        var teamId = _config["MakeApi:TeamId"];
        
        var response = await _httpClient.GetAsync($"scenarios?teamId={teamId}");

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"[DEBUG] Make API Error: {response.StatusCode} - {error}");
            throw new HttpRequestException($"Make API failed: {response.StatusCode}");
        }

        return await response.Content.ReadAsStringAsync();
    }

    public async Task<string> GetFoldersAsync()
    {
        var teamId = _config["MakeApi:TeamId"];

        var response = await _httpClient.GetAsync($"scenarios-folders?teamId={teamId}");

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"[DEBUG] Make API Error: {response.StatusCode} - {error}");
            throw new HttpRequestException($"Make API failed: {response.StatusCode}");
        }

        return await response.Content.ReadAsStringAsync();
    }

    public async Task<string> GetBlueprintAsync(int scenarioId)
    {
        var response = await _httpClient.GetAsync($"scenarios/{scenarioId}/blueprint");
        
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"[DEBUG] Blueprint Error: {response.StatusCode} - {errorBody}");
            throw new HttpRequestException($"Make API Blueprint failed: {response.StatusCode}");
        }

        return await response.Content.ReadAsStringAsync();
    }

    public async Task<string> PatchScenarioAsync(int scenarioId, object updateData)
    {        
        var jsonPayload = JsonSerializer.Serialize(updateData);
        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        var response = await _httpClient.PatchAsync($"scenarios/{scenarioId}", content);
        

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"[DEBUG] Make API Error: {response.StatusCode} - {error}");
            throw new HttpRequestException($"Make API failed: {response.StatusCode}");
        }

        return await response.Content.ReadAsStringAsync();
    }

    public async Task<string> GetConnectionsAsync()
    {
        var teamId = _config["MakeApi:TeamId"];

        var response = await _httpClient.GetAsync($"connections?teamId={teamId}");
        
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"[DEBUG] Make API Error: {response.StatusCode} - {errorBody}");
            throw new HttpRequestException($"Make API failed: {response.StatusCode}");
        }

        return await response.Content.ReadAsStringAsync();
    }
}