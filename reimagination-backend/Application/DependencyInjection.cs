using System.Reflection;
using AutoMapper;
using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using Application.Projects;
using Application.Assessments;

namespace Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Marker assembly for AutoMapper profile scanning
        var asm = typeof(DependencyInjection).Assembly;

        // AutoMapper DI (works with AutoMapper v13+ in the core package)
        services.AddAutoMapper(cfg => { }, asm);

        // ✅ Explicitly register validators (no extra package or namespace needed)
        services.AddScoped<IValidator<CreateProjectRequest>, CreateProjectRequestValidator>();
        services.AddScoped<IValidator<UpsertAssessmentRequest>, UpsertAssessmentRequestValidator>();

        return services;
    }
}
