using Infrastructure;
using Infrastructure.Data;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
});

// CORS for your Vite front-end
var origins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? Array.Empty<string>();
builder.Services.AddCors(opt =>
{
    opt.AddPolicy("ui", p => p.WithOrigins(origins).AllowAnyHeader().AllowAnyMethod().AllowCredentials());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Automation Benefits API", Version = "v1" });
    var jwtScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization", In = ParameterLocation.Header, Type = SecuritySchemeType.Http,
        Scheme = "bearer", BearerFormat = "JWT",
        Reference = new OpenApiReference { Id = "Bearer", Type = ReferenceType.SecurityScheme }
    };
    c.AddSecurityDefinition("Bearer", jwtScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement { { jwtScheme, new string[] { } } });
});

var app = builder.Build();

// Migrate + seed
using (var scope = app.Services.CreateScope())
{
    var sp = scope.ServiceProvider;
    await Seed.Initialize(sp);
}

app.UseSwagger();
app.UseSwaggerUI();

app.UseCors("ui");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
