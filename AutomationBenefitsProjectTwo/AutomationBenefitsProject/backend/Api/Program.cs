using Infrastructure;
using Infrastructure.Data;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Http;

var builder = WebApplication.CreateBuilder(args);

// 1) Services
builder.Services.AddInfrastructure(builder.Configuration);

// Make JWT the default scheme so [Authorize] uses Bearer tokens (not cookies)
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme    = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme             = JwtBearerDefaults.AuthenticationScheme;
});

builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

// -- CORS: named policy "ui" pulling from config
const string CorsPolicyName = "ui";
var origins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? Array.Empty<string>();

builder.Services.AddCors(opt =>
{
    opt.AddPolicy(CorsPolicyName, p =>
        p.WithOrigins(origins)            // must be exact (scheme + host + port)
         .AllowAnyHeader()
         .AllowAnyMethod()
         .AllowCredentials()              // fine to keep if you ever use cookies; ok with JWT too
    );
});

// If ASP.NET Identity cookies are present, prevent redirects for API paths
builder.Services.ConfigureApplicationCookie(options =>
{
    options.Events.OnRedirectToLogin = ctx =>
    {
        if (ctx.Request.Path.StartsWithSegments("/api"))
        {
            ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        }
        ctx.Response.Redirect(ctx.RedirectUri);
        return Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = ctx =>
    {
        if (ctx.Request.Path.StartsWithSegments("/api"))
        {
            ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        }
        ctx.Response.Redirect(ctx.RedirectUri);
        return Task.CompletedTask;
    };
});

// Also apply the same behavior to ANY cookie auth scheme that might be registered
builder.Services.PostConfigureAll<CookieAuthenticationOptions>(options =>
{
    options.Events ??= new CookieAuthenticationEvents();
    var prevLogin = options.Events.OnRedirectToLogin;
    var prevDenied = options.Events.OnRedirectToAccessDenied;

    options.Events.OnRedirectToLogin = ctx =>
    {
        if (ctx.Request.Path.StartsWithSegments("/api"))
        {
            ctx.Response.StatusCode = StatusCodes.Status401Unauthorized;
            return Task.CompletedTask;
        }
        return prevLogin?.Invoke(ctx) ?? Task.CompletedTask;
    };
    options.Events.OnRedirectToAccessDenied = ctx =>
    {
        if (ctx.Request.Path.StartsWithSegments("/api"))
        {
            ctx.Response.StatusCode = StatusCodes.Status403Forbidden;
            return Task.CompletedTask;
        }
        return prevDenied?.Invoke(ctx) ?? Task.CompletedTask;
    };
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Automation Benefits API", Version = "v1" });
    var jwtScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference { Id = "Bearer", Type = ReferenceType.SecurityScheme }
    };
    c.AddSecurityDefinition("Bearer", jwtScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement { { jwtScheme, Array.Empty<string>() } });
});

var app = builder.Build();

// 2) DB migrate/seed
using (var scope = app.Services.CreateScope())
{
    var sp = scope.ServiceProvider;
    await Seed.Initialize(sp);
}

// 3) Middleware ORDER matters:
// Put CORS EARLY so it applies to EVERYTHING (including Swagger JSON)
app.UseCors(CorsPolicyName);

// (Optional) app.UseHttpsRedirection();

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
