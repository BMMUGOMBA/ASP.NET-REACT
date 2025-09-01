using AutoMapper;
using Domain.Entities;

namespace Application.Mapping;
using Application.Projects;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<CreateProjectRequest, Project>()
            .ForMember(d => d.Id, opt => opt.Ignore())
            .ForMember(d => d.Status, opt => opt.MapFrom(_ => ProjectStatus.Submitted))
            .ForMember(d => d.CreatedAt, opt => opt.Ignore())
            .ForMember(d => d.UpdatedAt, opt => opt.Ignore())
            .ForMember(d => d.ReviewComments, opt => opt.Ignore());

        CreateMap<BenefitsDto, Benefits>();
        CreateMap<MetricRowDto, MetricRow>();
        CreateMap<CostInfoDto, CostInfo>();
        CreateMap<EfficiencyInfoDto, EfficiencyInfo>();
        CreateMap<BrdDto, Brd>();

        CreateMap<Project, ProjectResponse>();
        CreateMap<Benefits, BenefitsDto>();
        CreateMap<MetricRow, MetricRowDto>();
        CreateMap<CostInfo, CostInfoDto>();
        CreateMap<EfficiencyInfo, EfficiencyInfoDto>();
        CreateMap<Brd, BrdDto>();
    }
}
