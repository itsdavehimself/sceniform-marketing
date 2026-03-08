using DiffDetector.Api.Dtos;
using DiffDetector.Services;
using Microsoft.AspNetCore.Mvc;

namespace DiffDetector.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AppDomainController : ControllerBase
{
    private readonly LogoDevService _logoDevService;

    public AppDomainController(LogoDevService logoDevService)
    {
        _logoDevService = logoDevService;
    }

    [HttpGet("{accountName}")]
    public async Task<ActionResult<AppDomainDto>> GetDomain(string accountName)
    {
        if (string.IsNullOrWhiteSpace(accountName))
        {
            return BadRequest("Account name is required.");
        }

        var domain = await _logoDevService.GetOrFetchDomainAsync(accountName);

        return Ok(new AppDomainDto { Domain = domain });
    }
}