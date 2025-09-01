using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

public static class Seed
{
    public static async Task Initialize(IServiceProvider sp)
    {
        var db = sp.GetRequiredService<AppDbContext>();
        await db.Database.MigrateAsync();

        var userMgr = sp.GetRequiredService<UserManager<AppUser>>();
        var roleMgr = sp.GetRequiredService<RoleManager<IdentityRole<Guid>>>();

        foreach (var r in new[] { "Admin", "User" })
            if (!await roleMgr.RoleExistsAsync(r))
                await roleMgr.CreateAsync(new IdentityRole<Guid>(r));

        // Admin
        var adminEmail = "admin@example.com";
        var admin = await userMgr.Users.FirstOrDefaultAsync(x => x.Email == adminEmail);
        if (admin == null)
        {
            admin = new AppUser { UserName = adminEmail, Email = adminEmail, EmailConfirmed = true, DisplayName = "Admin" };
            await userMgr.CreateAsync(admin, "Password1!");
            await userMgr.AddToRoleAsync(admin, "Admin");
        }

        // User
        var userEmail = "user@example.com";
        var user = await userMgr.Users.FirstOrDefaultAsync(x => x.Email == userEmail);
        if (user == null)
        {
            user = new AppUser { UserName = userEmail, Email = userEmail, EmailConfirmed = true, DisplayName = "User One" };
            await userMgr.CreateAsync(user, "Password1!");
            await userMgr.AddToRoleAsync(user, "User");
        }
    }
}
