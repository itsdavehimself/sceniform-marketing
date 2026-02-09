using System.Net.Http.Headers;

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
}