using System;
using System.Collections.Generic;

namespace Domain.Entities;

public enum ProjectStatus { Draft = 0, Submitted = 1, NeedsChanges = 2, Approved = 3 }
public enum SizeRating { Small = 0, Medium = 1, Large = 2 }

public class Project
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // requester snapshot
    public string RequesterUserId { get; set; } = string.Empty;
    public string RequesterName { get; set; } = string.Empty;
    public string RequesterEmail { get; set; } = string.Empty;

    // status & timestamps
    public ProjectStatus Status { get; set; } = ProjectStatus.Submitted;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // core process sizing (matches your editor)
    public string ProcessName { get; set; } = string.Empty;
    public string BusinessUnit { get; set; } = string.Empty;
    public List<string> RolesImpacted { get; set; } = new();
    public List<string> SystemsImpacted { get; set; } = new();
    public int PercentAutomated { get; set; }
    public int StaffImpacted { get; set; }
    public int Breadth { get; set; }
    public int CycleTimeMinutes { get; set; }
    public int ComplexitySystems { get; set; }
    public int ManHoursPerMonth { get; set; }
    public string HowOftenText { get; set; } = string.Empty;
    public SizeRating SizeRating { get; set; } = SizeRating.Medium;

    // benefits + BRD
    public Benefits? Benefits { get; set; }
    public Brd? Brd { get; set; }

    // review comments
    public List<ReviewComment> ReviewComments { get; set; } = new();
}

public class Benefits
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public MetricRow TimeToCompleteCycle { get; set; } = new();
    public MetricRow TotalTimePerMonth { get; set; } = new();
    public MetricRow StaffRequired     { get; set; } = new();

    public CostInfo Cost { get; set; } = new();
    public EfficiencyInfo Efficiency { get; set; } = new();
    public string CxImpact { get; set; } = string.Empty;
    public string StaffSatisfactionImpact { get; set; } = string.Empty;
}

public class MetricRow
{
    public int Before { get; set; }
    public int After { get; set; }
    public int Savings { get; set; }
    public int PercentGain { get; set; }
}

public class CostInfo
{
    public int ManHoursSavedPerCycle { get; set; }
    public int ManHoursSavedPerPerson { get; set; }
    public int TotalManHoursSavedPerMonth { get; set; }
}

public class EfficiencyInfo
{
    public int GainPerCycle { get; set; }
    public int TotalEfficiencyGain { get; set; }
}

public class Brd
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Objective { get; set; } = string.Empty;
    public string Scope { get; set; } = string.Empty;
    public string Assumptions { get; set; } = string.Empty;
    public string AcceptanceCriteria { get; set; } = string.Empty;

    // file metadata (disk path saved in Infrastructure)
    public string? FileName { get; set; }
    public string? ContentType { get; set; }
    public string? FilePath { get; set; }
}

public class ReviewComment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string By { get; set; } = "Admin";
    public DateTime At { get; set; } = DateTime.UtcNow;
    public string Text { get; set; } = string.Empty;
}
