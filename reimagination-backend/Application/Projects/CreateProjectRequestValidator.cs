using FluentValidation;
using Domain;

namespace Application.Projects;

public class CreateProjectRequestValidator : AbstractValidator<CreateProjectRequest>
{
    public CreateProjectRequestValidator()
    {
        RuleFor(x => x.ProcessName).NotEmpty().MaximumLength(200);
        RuleFor(x => x.BusinessUnit).NotEmpty().MaximumLength(50);

        RuleFor(x => x.PercentAutomated).InclusiveBetween((byte)0, (byte)100);
        RuleFor(x => x.StaffImpacted).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Breadth).GreaterThanOrEqualTo(0);
        RuleFor(x => x.CycleTimeMinutes).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ComplexitySystems).GreaterThanOrEqualTo(0);
        RuleFor(x => x.ManHoursPerMonth).GreaterThanOrEqualTo(0);

        RuleFor(x => x.Frequency).IsInEnum();
        RuleFor(x => x.RolesImpacted).NotNull();
        RuleFor(x => x.SystemsImpacted).NotNull();
    }
}
