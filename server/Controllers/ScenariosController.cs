using DiffDetector.Api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace DiffDetector.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ScenariosController : ControllerBase
{
    private readonly MakeService _makeService;

    public ScenariosController(MakeService makeService)
    {
        _makeService = makeService;
    }

    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var data = await _makeService.GetScenariosAsync();
        return Ok(data);
    }

    [HttpGet("mock/{env}")]
    public async Task<IActionResult> GetMockBlueprint(string env)
    {
        string fileName = env.ToLower() == "prod" 
            ? "Search People PRODUCTION.blueprint.json" 
            : "Search People SANDBOX.blueprint.json";

        string filePath = Path.Combine("Mocks", fileName);

        if (!System.IO.File.Exists(filePath))
        {
            return NotFound(new { message = $"File not found at {filePath}" });
        }

        var json = await System.IO.File.ReadAllTextAsync(filePath);
        return Ok(new { blueprint = json });
    }

   [HttpGet("{id}/blueprint")]
    public async Task<IActionResult> GetBlueprint(int id)
    {
        try
        {
            var rawJson = await _makeService.GetBlueprintAsync(id);
            
            using var document = JsonDocument.Parse(rawJson);
            
            if (document.RootElement.TryGetProperty("response", out var responseElement) &&
                responseElement.TryGetProperty("blueprint", out var blueprintElement))
            {
                return Content(blueprintElement.GetRawText(), "application/json");
            }

            return Content(rawJson, "application/json");
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPatch("{id}/update")]
    public async Task<IActionResult> UpdateScenario(int id, [FromBody] JsonElement blueprint)
    {
        try
        {
            if (blueprint.ValueKind == JsonValueKind.Undefined)
            {
                return BadRequest("Blueprint data is missing.");
            }

            var result = await _makeService.PatchScenarioAsync(id, blueprint);
            if (!string.IsNullOrEmpty(result)) return Ok(new { message = "Blueprint updated successfully."});
            return BadRequest("Failed to update blueprint.");
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("connections")]
    public async Task<IActionResult> GetConnections()
    {
        try
        {
            var rawJson = await _makeService.GetConnectionsAsync();
            return Content(rawJson, "application/json");
        }
        catch (HttpRequestException ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}