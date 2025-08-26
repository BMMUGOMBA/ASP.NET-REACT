using Infrastructure.Auth;
using Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;

namespace Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(config.GetConnectionString("DefaultConnection")));

        // ✅ API-friendly identity registration
        services
            .AddIdentityCore<ApplicationUser>(opt =>
            {
                opt.User.RequireUniqueEmail = true;
                // Demo-friendly; tighten for prod
                opt.Password.RequireNonAlphanumeric = false;
                opt.Password.RequireUppercase = false;
                opt.Password.RequireLowercase = true;
                opt.Password.RequiredLength = 6;
            })
            .AddRoles<IdentityRole<Guid>>()                     // we use roles: Admin/User
            .AddEntityFrameworkStores<AppDbContext>()           // EF Core backing store
            .AddSignInManager<SignInManager<ApplicationUser>>() // needed for CheckPasswordSignInAsync in AuthController
            .AddDefaultTokenProviders();                        // password reset, etc.

        return services;
    }
}
