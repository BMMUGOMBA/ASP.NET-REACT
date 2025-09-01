using System.Collections.Generic;
using Domain.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using System.Text.Json;

namespace Infrastructure.Data;

public class AppDbContext : IdentityDbContext<AppUser, Microsoft.AspNetCore.Identity.IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) {}

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<Benefits> Benefits => Set<Benefits>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        var listConverter = new ValueConverter<List<string>, string>(
            v => JsonSerializer.Serialize(v, (JsonSerializerOptions?)null),
            v => string.IsNullOrWhiteSpace(v) ? new List<string>() : JsonSerializer.Deserialize<List<string>>(v)!);

        b.Entity<Project>(e =>
        {
            e.Property(p => p.RolesImpacted).HasConversion(listConverter);
            e.Property(p => p.SystemsImpacted).HasConversion(listConverter);

            e.OwnsOne(p => p.Brd);
            e.OwnsMany(p => p.ReviewComments);

            e.HasOne(p => p.Benefits).WithOne().HasForeignKey<Benefits>("ProjectId");
        });

        b.Entity<Benefits>(e =>
        {
            e.OwnsOne(x => x.TimeToCompleteCycle);
            e.OwnsOne(x => x.TotalTimePerMonth);
            e.OwnsOne(x => x.StaffRequired);
            e.OwnsOne(x => x.Cost);
            e.OwnsOne(x => x.Efficiency);
        });
    }
}
