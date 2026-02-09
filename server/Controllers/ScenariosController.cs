using DiffDetector.Api.Services;
using Microsoft.AspNetCore.Mvc;

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
}