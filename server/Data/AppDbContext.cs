using Microsoft.EntityFrameworkCore;

namespace DiffDetector.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

}