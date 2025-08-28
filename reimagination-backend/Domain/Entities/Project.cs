using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class Project
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Ownership
    public Guid RequesterUserId { get; set; }
    public string RequesterName { get; set; } = "";
    public string RequesterEmail { get; set; } = "";

    // Process info
    public string ProcessName { get; set; } = "";
    public string BusinessUnit { get; set; } = "";
    public string RolesImpactedCsv { get; set; } = "";     // comma-separated
    public string SystemsImpactedCsv { get; set; } = "";   // comma-separated

    // Metrics
    public byte PercentAutomated { get; set; }             // 0..100
    public int StaffImpacted { get; set; }

    // Sizing
    public Frequency Frequency { get; set; }
    public int Breadth { get; set; }                       // # people
    public int CycleTimeMinutes { get; set; }              // store minutes
    public int ComplexitySystems { get; set; }
    public decimal ManHoursPerMonth { get; set; }

    // Lifecycle
    public ProjectStatus Status { get; set; } = ProjectStatus.Submitted;
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;

    // Concurrency
    public byte[] RowVersion { get; set; } = Array.Empty<byte>();

    // Navs
    public AdminAssessment? Assessment { get; set; }
    public List<StatusHistory> StatusHistory { get; set; } = new();
}
