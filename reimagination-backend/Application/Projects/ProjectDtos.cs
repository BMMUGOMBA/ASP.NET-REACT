using System;
using Domain;

namespace Application.Projects;

public record CreateProjectRequest(
    string ProcessName,
    string BusinessUnit,
    string[] RolesImpacted,
    string[] SystemsImpacted,
    byte PercentAutomated,
    int StaffImpacted,
    Frequency Frequency,
    int Breadth,
    int CycleTimeMinutes,
    int ComplexitySystems,
    decimal ManHoursPerMonth
);

public record ProjectListItemDto(
    Guid Id,
    string ProcessName,
    string BusinessUnit,
    string RequesterName,
    string RequesterEmail,
    ProjectStatus Status,
    DateTime UpdatedAtUtc
);

public record ProjectDetailDto(
    Guid Id,
    string ProcessName,
    string BusinessUnit,
    string[] RolesImpacted,
    string[] SystemsImpacted,
    byte PercentAutomated,
    int StaffImpacted,
    Frequency Frequency,
    int Breadth,
    int CycleTimeMinutes,
    int ComplexitySystems,
    decimal ManHoursPerMonth,
    ProjectStatus Status,
    string RequesterName,
    string RequesterEmail,
    DateTime CreatedAtUtc,
    DateTime UpdatedAtUtc
);
