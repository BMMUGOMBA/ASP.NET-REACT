using FluentValidation;

namespace Application.Assessments;

public class UpsertAssessmentRequestValidator : AbstractValidator<UpsertAssessmentRequest>
{
    public UpsertAssessmentRequestValidator()
    {
        RuleForEach(x => x.Quantitative).NotEmpty().MaximumLength(300);
        RuleForEach(x => x.Qualitative).NotEmpty().MaximumLength(300);
        RuleFor(x => x.Quantitative).Must(a => a.Length <= 3).WithMessage("Max 3 quantitative benefits");
        RuleFor(x => x.Qualitative).Must(a => a.Length <= 3).WithMessage("Max 3 qualitative benefits");
    }
}
