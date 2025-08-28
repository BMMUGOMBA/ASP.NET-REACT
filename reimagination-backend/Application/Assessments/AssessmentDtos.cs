using System;
using Domain;

namespace Application.Assessments;

public record AssessmentDto(
    Guid ProjectId,
    Guid? OwnerUserId,
    bool? DocumentedOld,
    bool? DocumentedNew,
    bool? GovernanceOk,
    bool? WorkloadAssessment,
    TriState? RequiresDocChange,
    TriState? RetrainingRequired,
    TriState? BenefitsRealized,
    TriState? RoleIntegrationScope,
    string NotesBenefits,
    string NotesRealization,
    string NotesRoleIntegration,
    string NotesOther,
    string[] Quantitative,  // up to 3
    string[] Qualitative    // up to 3
);

public record UpsertAssessmentRequest(
    Guid? OwnerUserId,
    bool? DocumentedOld,
    bool? DocumentedNew,
    bool? GovernanceOk,
    bool? WorkloadAssessment,
    TriState? RequiresDocChange,
    TriState? RetrainingRequired,
    TriState? BenefitsRealized,
    TriState? RoleIntegrationScope,
    string NotesBenefits,
    string NotesRealization,
    string NotesRoleIntegration,
    string NotesOther,
    string[] Quantitative,
    string[] Qualitative
);
