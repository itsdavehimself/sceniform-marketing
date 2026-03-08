using System.Net.Http.Headers;
using System.Text.Json;
using System.Text.RegularExpressions;
using DiffDetector.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace DiffDetector.Services;

public class LogoDevService
{
    private readonly AppDbContext _context;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;

    public LogoDevService(AppDbContext context, HttpClient httpClient, IConfiguration configuration)
    {
        _context = context;
        _httpClient = httpClient;
        _configuration = configuration;
    }

    public async Task<string> GetOrFetchDomainAsync(string accountName)
    {
        if (string.IsNullOrWhiteSpace(accountName)) return "make.com";

        var cachedApp = await _context.AppDomainCaches
            .FirstOrDefaultAsync(a => a.AccountName.ToLower() == accountName.ToLower());

        if (cachedApp != null)
        {
            return cachedApp.Domain;
        }

        var cleanName = CleanAccountName(accountName);

        var secretKey = _configuration["LogoDev:SecretKey"];
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", secretKey);

        var requestUrl = $"https://api.logo.dev/search?q={Uri.EscapeDataString(cleanName)}&strategy=match";
        var response = await _httpClient.GetAsync(requestUrl);

        string resolvedDomain = "make.com";

        if (response.IsSuccessStatusCode)
        {
            var jsonResponse = await response.Content.ReadAsStringAsync();
            var searchResults = JsonSerializer.Deserialize<List<LogoDevSearchResult>>(jsonResponse, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

            if (searchResults != null && searchResults.Count > 0)
            {
                resolvedDomain = searchResults.First().Domain;
            }
        }

        var newCacheEntry = new AppDomainCache
        {
            AccountName = accountName,
            Domain = resolvedDomain,
            CreatedAt = DateTime.UtcNow
        };

        _context.AppDomainCaches.Add(newCacheEntry);
        await _context.SaveChangesAsync();

        return resolvedDomain;
    }

    private string CleanAccountName(string accountName)
    {
        var cleanName = accountName.ToLower();
        
        if (cleanName.StartsWith("app#"))
        {
            cleanName = cleanName.Split('#')[1];
        }
        
        cleanName = Regex.Replace(cleanName, @"[0-9]+$", "");
        cleanName = cleanName.Split('-')[0]; 
        
        return cleanName;
    }

    private class LogoDevSearchResult
    {
        public string Name { get; set; } = string.Empty;
        public string Domain { get; set; } = string.Empty;
    }
}