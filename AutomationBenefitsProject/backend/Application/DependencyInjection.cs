using AutoMapper;
using Microsoft.Extensions.DependencyInjection;
using FluentValidation;

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddAutoMapper(typeof(Application.Mapping.MappingProfile).Assembly);
        services.AddValidatorsFromAssemblyContaining<Application.Projects.CreateProjectRequestValidator>();
        return services;
    }
}
