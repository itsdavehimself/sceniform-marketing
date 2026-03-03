using DiffDetector.Api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;

namespace DiffDetector.Api.Controllers;

[Authorize]
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
    public async Task<IActionResult> Get([FromQuery] int teamId, [FromQuery] string zone)
    {
        try
        {
            if (teamId <= 0 || string.IsNullOrEmpty(zone))
                return BadRequest("Missing teamId or zone parameters.");

            var data = await _makeService.GetScenariosAsync(teamId, zone);
            return Content(data, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

   [HttpGet("{id}/blueprint")]
    public async Task<IActionResult> GetBlueprint(int id, [FromQuery] string zone)
    {
        try
        {
            if (string.IsNullOrEmpty(zone)) return BadRequest("Missing zone parameter.");

            var rawJson = await _makeService.GetBlueprintAsync(id, zone);
            
            using var document = JsonDocument.Parse(rawJson);
            
            if (document.RootElement.TryGetProperty("response", out var responseElement) &&
                responseElement.TryGetProperty("blueprint", out var blueprintElement))
            {
                return Content(blueprintElement.GetRawText(), "application/json");
            }

            return Content(rawJson, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpPatch("{id}/update")]
    public async Task<IActionResult> UpdateScenario(int id, [FromQuery] string zone, [FromBody] JsonElement blueprint)
    {
        try
        {
            if (string.IsNullOrEmpty(zone)) return BadRequest("Missing zone parameter.");
            if (blueprint.ValueKind == JsonValueKind.Undefined) return BadRequest("Blueprint data is missing.");

            var result = await _makeService.PatchScenarioAsync(id, zone, blueprint);
            if (!string.IsNullOrEmpty(result)) return Ok(new { message = "Blueprint updated successfully."});
            return BadRequest("Failed to update blueprint.");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("connections")]
    public async Task<IActionResult> GetConnections([FromQuery] int teamId, [FromQuery] string zone)
    {
        try
        {
            if (teamId <= 0 || string.IsNullOrEmpty(zone)) return BadRequest("Missing teamId or zone parameters.");

            var rawJson = await _makeService.GetConnectionsAsync(teamId, zone);
            return Content(rawJson, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }

    [HttpGet("folders")]
    public async Task<IActionResult> GetFolders([FromQuery] int teamId, [FromQuery] string zone)
    {
        try
        {
            if (teamId <= 0 || string.IsNullOrEmpty(zone)) return BadRequest("Missing teamId or zone parameters.");

            var rawJson = await _makeService.GetFoldersAsync(teamId, zone);
            return Content(rawJson, "application/json");
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = ex.Message });
        }
    }
}