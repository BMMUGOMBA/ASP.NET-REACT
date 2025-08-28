using System;
using System.Linq; // 👈 add this line
using AutoMapper;
using Domain.Entities;
using Application.Projects;
using Application.Assessments;

namespace Application.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<Project, ProjectListItemDto>()
            .ForCtorParam("Id", o => o.MapFrom(s => s.Id))
            .ForCtorParam("ProcessName", o => o.MapFrom(s => s.ProcessName))
            .ForCtorParam("BusinessUnit", o => o.MapFrom(s => s.BusinessUnit))
            .ForCtorParam("RequesterName", o => o.MapFrom(s => s.RequesterName))
            .ForCtorParam("RequesterEmail", o => o.MapFrom(s => s.RequesterEmail))
            .ForCtorParam("Status", o => o.MapFrom(s => s.Status))
            .ForCtorParam("UpdatedAtUtc", o => o.MapFrom(s => s.UpdatedAtUtc));

        CreateMap<Project, ProjectDetailDto>()
            .ForCtorParam("RolesImpacted", o => o.MapFrom(s => SplitCsv(s.RolesImpactedCsv)))
            .ForCtorParam("SystemsImpacted", o => o.MapFrom(s => SplitCsv(s.SystemsImpactedCsv)));

        CreateMap<AdminAssessment, AssessmentDto>()
            .ForCtorParam("ProjectId", o => o.MapFrom(s => s.ProjectId))
            .ForCtorParam("OwnerUserId", o => o.MapFrom(s => s.OwnerUserId))
            .ForCtorParam("DocumentedOld", o => o.MapFrom(s => s.DocumentedOld))
            .ForCtorParam("DocumentedNew", o => o.MapFrom(s => s.DocumentedNew))
            .ForCtorParam("GovernanceOk", o => o.MapFrom(s => s.GovernanceOk))
            .ForCtorParam("WorkloadAssessment", o => o.MapFrom(s => s.WorkloadAssessment))
            .ForCtorParam("RequiresDocChange", o => o.MapFrom(s => s.RequiresDocChange))
            .ForCtorParam("RetrainingRequired", o => o.MapFrom(s => s.RetrainingRequired))
            .ForCtorParam("BenefitsRealized", o => o.MapFrom(s => s.BenefitsRealized))
            .ForCtorParam("RoleIntegrationScope", o => o.MapFrom(s => s.RoleIntegrationScope))
            .ForCtorParam("NotesBenefits", o => o.MapFrom(s => s.NotesBenefits))
            .ForCtorParam("NotesRealization", o => o.MapFrom(s => s.NotesRealization))
            .ForCtorParam("NotesRoleIntegration", o => o.MapFrom(s => s.NotesRoleIntegration))
            .ForCtorParam("NotesOther", o => o.MapFrom(s => s.NotesOther))
            .ForCtorParam("Quantitative", o => o.MapFrom(s => s.Benefits.Where(b => b.Kind == Domain.BenefitKind.Quantitative).OrderBy(b => b.Order).Select(b => b.Text).ToArray()))
            .ForCtorParam("Qualitative", o => o.MapFrom(s => s.Benefits.Where(b => b.Kind == Domain.BenefitKind.Qualitative).OrderBy(b => b.Order).Select(b => b.Text).ToArray()));
    }

    private static string[] SplitCsv(string csv) =>
        string.IsNullOrWhiteSpace(csv) ? Array.Empty<string>() :
        csv.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);
}
