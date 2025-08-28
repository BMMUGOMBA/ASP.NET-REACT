using System;

namespace Domain.Entities;

public class Benefit
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid AssessmentId { get; set; }
    public BenefitKind Kind { get; set; }      // Quantitative / Qualitative
    public byte Order { get; set; }            // 1..3
    public string Text { get; set; } = "";

    public AdminAssessment Assessment { get; set; } = null!;
}
