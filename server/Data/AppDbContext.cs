using Microsoft.EntityFrameworkCore;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Organization> Organizations { get; set; }
    public DbSet<OrganizationUser> OrganizationUsers { get; set; }
    public DbSet<MakeConnection> MakeConnections { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>()
            .HasIndex(u => u.ClerkUserId)
            .IsUnique();

        modelBuilder.Entity<Organization>()
            .HasIndex(o => o.ClerkOrgId)
            .IsUnique();

        modelBuilder.Entity<OrganizationUser>()
            .HasKey(ou => new { ou.UserId, ou.OrganizationId });

        modelBuilder.Entity<OrganizationUser>()
            .HasOne(ou => ou.User)
            .WithMany(u => u.OrganizationMemberships)
            .HasForeignKey(ou => ou.UserId);

        modelBuilder.Entity<OrganizationUser>()
            .HasOne(ou => ou.Organization)
            .WithMany(o => o.Members)
            .HasForeignKey(ou => ou.OrganizationId);

        modelBuilder.Entity<MakeConnection>()
            .HasOne(mc => mc.Organization)
            .WithMany(o => o.MakeConnections)
            .HasForeignKey(mc => mc.OrganizationId)
            .OnDelete(DeleteBehavior.Cascade); 

        modelBuilder.Entity<MakeConnection>()
            .HasOne(mc => mc.AddedByUser)
            .WithMany(u => u.AddedConnections)
            .HasForeignKey(mc => mc.AddedByUserId)
            .OnDelete(DeleteBehavior.Restrict); 
    }
}