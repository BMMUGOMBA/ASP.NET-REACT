// Application/DependencyInjection.cs
using AutoMapper;
using Microsoft.Extensions.DependencyInjection;
using FluentValidation; // <-- required for AddValidatorsFromAssemblyContaining

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(Application.Mapping.MappingProfile).Assembly);

        // Registers all validators in the Application assembly (CreateProjectRequestValidator, etc.)
        services.AddValidatorsFromAssemblyContaining<Application.Projects.CreateProjectRequestValidator>();

        return services;
    }
}
