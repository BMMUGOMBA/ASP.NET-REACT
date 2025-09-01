using System;
using System.Collections.Generic;
using Domain.Entities;

namespace Application.Projects;

public record MetricRowDto(int Before, int After, int Savings, int PercentGain);
public record CostInfoDto(int ManHoursSavedPerCycle, int ManHoursSavedPerPerson, int TotalManHoursSavedPerMonth);
public record EfficiencyInfoDto(int GainPerCycle, int TotalEfficiencyGain);

public record BenefitsDto(
    MetricRowDto TimeToCompleteCycle,
    MetricRowDto TotalTimePerMonth,
    MetricRowDto StaffRequired,
    CostInfoDto Cost,
    EfficiencyInfoDto Efficiency,
    string CxImpact,
    string StaffSatisfactionImpact
);

public record BrdDto(
    string? Objective,
    string? Scope,
    string? Assumptions,
    string? AcceptanceCriteria,
    string? FileName,
    string? ContentType,
    string? FilePath
);

public record CreateProjectRequest(
    string ProcessName,
    string BusinessUnit,
    List<string> RolesImpacted,
    List<string> SystemsImpacted,
    int PercentAutomated,
    int StaffImpacted,
    int Breadth,
    int CycleTimeMinutes,
    int ComplexitySystems,
    int ManHoursPerMonth,
    string HowOftenText,
    SizeRating SizeRating,
    BenefitsDto? Benefits,
    BrdDto? Brd
);

public record ProjectResponse(
    Guid Id,
    string RequesterUserId,
    string RequesterName,
    string RequesterEmail,
    ProjectStatus Status,
    DateTime CreatedAt,
    DateTime UpdatedAt,
    string ProcessName,
    string BusinessUnit,
    List<string> RolesImpacted,
    List<string> SystemsImpacted,
    int PercentAutomated,
    int StaffImpacted,
    int Breadth,
    int CycleTimeMinutes,
    int ComplexitySystems,
    int ManHoursPerMonth,
    string HowOftenText,
    SizeRating SizeRating,
    BenefitsDto? Benefits,
    BrdDto? Brd,
    List<Domain.Entities.ReviewComment> ReviewComments
);
