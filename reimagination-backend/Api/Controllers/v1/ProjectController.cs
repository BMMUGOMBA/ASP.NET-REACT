using Api.Security;
using Application.Common;
using Application.Projects;
using AutoMapper;
using Domain;
using Domain.Entities;
using Infrastructure.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers.v1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/projects")]
[Authorize] // user or admin
public class ProjectsController : ControllerBase
{
    private readonly IProjectRepository _repo;
    private readonly IMapper _mapper;
    private readonly ICurrentUser _me;

    public ProjectsController(IProjectRepository repo, IMapper mapper, ICurrentUser me)
    {
        _repo = repo; _mapper = mapper; _me = me;
    }

    // POST /projects
    [HttpPost]
    [Authorize(Roles = "User,Admin")]
    public async Task<ActionResult<ProjectDetailDto>> Create([FromBody] CreateProjectRequest req, CancellationToken ct)
    {
        // map to entity
        var p = new Project
        {
            RequesterUserId = _me.UserId,
            RequesterEmail   = _me.Email,
            RequesterName    = _me.Name,
            ProcessName      = req.ProcessName,
            BusinessUnit     = req.BusinessUnit,
            RolesImpactedCsv = string.Join(", ", req.RolesImpacted ?? Array.Empty<string>()),
            SystemsImpactedCsv = string.Join(", ", req.SystemsImpacted ?? Array.Empty<string>()),
            PercentAutomated = req.PercentAutomated,
            StaffImpacted    = req.StaffImpacted,
            Frequency        = req.Frequency,
            Breadth          = req.Breadth,
            CycleTimeMinutes = req.CycleTimeMinutes,
            ComplexitySystems = req.ComplexitySystems,
            ManHoursPerMonth  = req.ManHoursPerMonth,
            Status           = ProjectStatus.Submitted
        };

        await _repo.AddAsync(p, ct);

        var dto = _mapper.Map<ProjectDetailDto>(p);
        return CreatedAtAction(nameof(GetById), new { id = p.Id, version = "1.0" }, dto);
    }

    // GET /projects/mine?status=&q=&page=1&pageSize=20
    [HttpGet("mine")]
    [Authorize(Roles = "User,Admin")]
    public async Task<ActionResult<PagedResult<ProjectListItemDto>>> MyProjects(
        [FromQuery] ProjectStatus? status,
        [FromQuery] string? q,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var baseQ = _repo.Query().Where(p => p.RequesterUserId == _me.UserId);

        if (status.HasValue) baseQ = baseQ.Where(p => p.Status == status.Value);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var ql = q.ToLower();
            baseQ = baseQ.Where(p =>
                p.ProcessName.ToLower().Contains(ql) ||
                p.RequesterEmail.ToLower().Contains(ql) ||
                p.RequesterName.ToLower().Contains(ql) ||
                p.BusinessUnit.ToLower().Contains(ql));
        }

        var total = await baseQ.CountAsync(ct);
        var items = await baseQ
            .OrderByDescending(p => p.UpdatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var dtos = items.Select(_mapper.Map<ProjectListItemDto>).ToList();
        Response.Headers["X-Total-Count"] = total.ToString();
        return Ok(new PagedResult<ProjectListItemDto>(dtos, total, page, pageSize));
    }

    // GET /projects/{id}
    [HttpGet("{id:guid}")]
    [Authorize(Roles = "User,Admin")]
    public async Task<ActionResult<ProjectDetailDto>> GetById(Guid id, CancellationToken ct)
    {
        var p = await _repo.GetAsync(id, ct);
        if (p is null) return NotFound();

        if (!_me.IsAdmin && p.RequesterUserId != _me.UserId)
            return Forbid();

        return Ok(_mapper.Map<ProjectDetailDto>(p));
    }
}
