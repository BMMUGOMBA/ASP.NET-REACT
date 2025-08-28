using Infrastructure.Auth;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Domain.Entities;

namespace Infrastructure.Data;

public class AppDbContext : IdentityDbContext<ApplicationUser, IdentityRole<Guid>, Guid>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Project> Projects => Set<Project>();
    public DbSet<AdminAssessment> Assessments => Set<AdminAssessment>();
    public DbSet<Benefit> Benefits => Set<Benefit>();
    public DbSet<StatusHistory> StatusHistories => Set<StatusHistory>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        base.OnModelCreating(b);

        b.Entity<Project>(e =>
        {
            e.ToTable("Projects");
            e.HasKey(x => x.Id);
            e.Property(x => x.ProcessName).HasMaxLength(200).IsRequired();
            e.Property(x => x.BusinessUnit).HasMaxLength(50).IsRequired();
            e.Property(x => x.RolesImpactedCsv).HasMaxLength(2000);
            e.Property(x => x.SystemsImpactedCsv).HasMaxLength(2000);
            e.Property(x => x.ManHoursPerMonth).HasColumnType("decimal(10,2)");
            e.Property(x => x.RowVersion).IsRowVersion();
            e.HasIndex(x => new { x.Status, x.UpdatedAtUtc });
            e.HasOne(x => x.Assessment)
                .WithOne(a => a.Project)
                .HasForeignKey<AdminAssessment>(a => a.ProjectId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<AdminAssessment>(e =>
        {
            e.ToTable("AdminAssessments");
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.ProjectId).IsUnique();
        });

        b.Entity<Benefit>(e =>
        {
            e.ToTable("Benefits");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.AssessmentId, x.Kind, x.Order }).IsUnique();
            e.Property(x => x.Text).HasMaxLength(300).IsRequired();
            e.HasOne(x => x.Assessment)
                .WithMany(a => a.Benefits)
                .HasForeignKey(x => x.AssessmentId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        b.Entity<StatusHistory>(e =>
        {
            e.ToTable("StatusHistory");
            e.HasKey(x => x.Id);
            e.HasIndex(x => new { x.ProjectId, x.ChangedAtUtc });
            e.Property(x => x.Reason).HasMaxLength(300);
        });
    }
}
