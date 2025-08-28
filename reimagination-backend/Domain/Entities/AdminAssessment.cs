using System;
using System.Collections.Generic;

namespace Domain.Entities;

public class AdminAssessment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid ProjectId { get; set; }
    public Guid? OwnerUserId { get; set; } // optional

    // Binary (nullable)
    public bool? DocumentedOld { get; set; }
    public bool? DocumentedNew { get; set; }
    public bool? GovernanceOk { get; set; }
    public bool? WorkloadAssessment { get; set; }

    // Ternary
    public TriState? RequiresDocChange { get; set; }
    public TriState? RetrainingRequired { get; set; }
    public TriState? BenefitsRealized { get; set; }
    public TriState? RoleIntegrationScope { get; set; }

    // Notes
    public string NotesBenefits { get; set; } = "";
    public string NotesRealization { get; set; } = "";
    public string NotesRoleIntegration { get; set; } = "";
    public string NotesOther { get; set; } = "";

    public List<Benefit> Benefits { get; set; } = new();
    public Project Project { get; set; } = null!;
}
