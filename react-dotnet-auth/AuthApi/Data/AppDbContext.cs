using AuthApi.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace AuthApi.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<RefreshToken>(b =>
        {
            b.HasIndex(r => new { r.UserId, r.TokenHash }).IsUnique();
            b.Property(r => r.TokenHash).IsRequired();
            b.Property(r => r.UserId).IsRequired();
        });
    }
}
