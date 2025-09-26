using FluentValidation;

namespace Application.Projects;

public class CreateProjectRequestValidator : AbstractValidator<CreateProjectRequest>
{
    public CreateProjectRequestValidator()
    {
        RuleFor(x => x.ProcessName).NotEmpty().MinimumLength(2);
        RuleFor(x => x.BusinessUnit).NotEmpty();
        RuleFor(x => x.RolesImpacted).NotEmpty();
        RuleFor(x => x.SystemsImpacted).NotEmpty();
        RuleFor(x => x.PercentAutomated).InclusiveBetween(0, 100);
        RuleFor(x => x.StaffImpacted).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Breadth).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CycleTimeMinutes).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ComplexitySystems).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ManHoursPerMonth).GreaterThanOrEqualTo(0);
        RuleFor(x => x.HowOftenText).NotEmpty();
    }
}
