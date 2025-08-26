using Infrastructure.Auth;
using Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public class DataSeeder
{
    private readonly RoleManager<IdentityRole<Guid>> _roles;
    private readonly UserManager<ApplicationUser> _users;
    private readonly AppDbContext _db;

    public DataSeeder(RoleManager<IdentityRole<Guid>> roles, UserManager<ApplicationUser> users, AppDbContext db)
    {
        _roles = roles; _users = users; _db = db;
    }

    public async Task SeedAsync()
    {
        // Roles
        var roleNames = new[] { "Admin", "User" };
        foreach (var r in roleNames)
            if (!await _roles.RoleExistsAsync(r))
                await _roles.CreateAsync(new IdentityRole<Guid>(r));

        // Admin
        var adminEmail = "admin@example.com";
        if (await _users.Users.AllAsync(u => u.Email != adminEmail))
        {
            var admin = new ApplicationUser { UserName = "admin", Email = adminEmail, EmailConfirmed = true };
            await _users.CreateAsync(admin, "Admin123$");
            await _users.AddToRoleAsync(admin, "Admin");
        }

        // Demo user
        var userEmail = "user@example.com";
        if (await _users.Users.AllAsync(u => u.Email != userEmail))
        {
            var user = new ApplicationUser { UserName = "user", Email = userEmail, EmailConfirmed = true };
            await _users.CreateAsync(user, "User123$");
            await _users.AddToRoleAsync(user, "User");
        }
    }
}
