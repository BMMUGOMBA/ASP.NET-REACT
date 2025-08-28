using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        var cs = Environment.GetEnvironmentVariable("DefaultConnection")
                 ?? "Server=(localdb)\\MSSQLLocalDB;Database=AutomationBenefitsDb;Trusted_Connection=True;MultipleActiveResultSets=true;TrustServerCertificate=True";

        var opts = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlServer(cs)
            .Options;

        return new AppDbContext(opts);
    }
}
