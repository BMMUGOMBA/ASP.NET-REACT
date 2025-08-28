using Api.Security;
using Api.Services;
using Application.Assessments;
using Application.Common;
using Application.Projects;
using AutoMapper;
using Domain;
using Domain.Entities;
using Infrastructure.Data;
using Infrastructure.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Api.Controllers.v1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/admin/projects")]
[Authorize(Roles = "Admin")]
public class AdminProjectsController : ControllerBase
{
    private readonly IProjectRepository _repo;
    private readonly AppDbContext _db;
    private readonly IMapper _mapper;
    private readonly ICurrentUser _me;

    public AdminProjectsController(IProjectRepository repo, AppDbContext db, IMapper mapper, ICurrentUser me)
    {
        _repo = repo; _db = db; _mapper = mapper; _me = me;
    }

    // GET /admin/projects?status=&bu=&q=&from=&to=&page=&pageSize=&sort=updatedAt_desc
    [HttpGet]
    public async Task<ActionResult<PagedResult<ProjectListItemDto>>> List(
        [FromQuery] ProjectStatus? status,
        [FromQuery] string? bu,
        [FromQuery] string? q,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] string? sort = "updatedAt_desc",
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var baseQ = _repo.Query();

        if (status.HasValue) baseQ = baseQ.Where(p => p.Status == status.Value);
        if (!string.IsNullOrWhiteSpace(bu)) baseQ = baseQ.Where(p => p.BusinessUnit == bu);
        if (from.HasValue) baseQ = baseQ.Where(p => p.UpdatedAtUtc >= from.Value);
        if (to.HasValue) baseQ = baseQ.Where(p => p.UpdatedAtUtc <= to.Value);

        if (!string.IsNullOrWhiteSpace(q))
        {
            var ql = q.ToLower();
            baseQ = baseQ.Where(p =>
                p.ProcessName.ToLower().Contains(ql) ||
                p.RequesterEmail.ToLower().Contains(ql) ||
                p.RequesterName.ToLower().Contains(ql));
        }

        baseQ = sort switch
        {
            "process_asc"  => baseQ.OrderBy(p => p.ProcessName),
            "process_desc" => baseQ.OrderByDescending(p => p.ProcessName),
            "updatedAt_asc" => baseQ.OrderBy(p => p.UpdatedAtUtc),
            _ => baseQ.OrderByDescending(p => p.UpdatedAtUtc),
        };

        var total = await baseQ.CountAsync(ct);
        var items = await baseQ.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync(ct);
        var dtos = items.Select(_mapper.Map<ProjectListItemDto>).ToList();
        Response.Headers["X-Total-Count"] = total.ToString();
        return Ok(new PagedResult<ProjectListItemDto>(dtos, total, page, pageSize));
    }

    // PATCH /admin/projects/{id}/status
    public record ChangeStatusRequest(ProjectStatus ToStatus, string? Reason);

    [HttpPatch("{id:guid}/status")]
    public async Task<ActionResult> ChangeStatus(Guid id, [FromBody] ChangeStatusRequest req, CancellationToken ct)
    {
        var p = await _db.Projects.FirstOrDefaultAsync(x => x.Id == id, ct);
        if (p is null) return NotFound();

        if (!StatusTransitionService.IsAllowed(p.Status, req.ToStatus, isAdmin: true))
            return BadRequest(new { message = $"Transition {p.Status} -> {req.ToStatus} not allowed" });

        var hist = new StatusHistory
        {
            ProjectId = p.Id,
            FromStatus = p.Status,
            ToStatus = req.ToStatus,
            ChangedByUserId = _me.UserId,
            Reason = req.Reason ?? ""
        };

        p.Status = req.ToStatus;
        p.UpdatedAtUtc = DateTime.UtcNow;
        _db.StatusHistories.Add(hist);
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    // PUT /admin/projects/{id}/assessment
    [HttpPut("{id:guid}/assessment")]
    public async Task<ActionResult> UpsertAssessment(Guid id, [FromBody] UpsertAssessmentRequest req, CancellationToken ct)
    {
        var p = await _db.Projects
            .Include(x => x.Assessment)
            .ThenInclude(a => a!.Benefits)
            .FirstOrDefaultAsync(x => x.Id == id, ct);

        if (p is null) return NotFound();

        var a = p.Assessment ?? new AdminAssessment { ProjectId = p.Id };
        a.OwnerUserId = req.OwnerUserId;
        a.DocumentedOld = req.DocumentedOld;
        a.DocumentedNew = req.DocumentedNew;
        a.GovernanceOk = req.GovernanceOk;
        a.WorkloadAssessment = req.WorkloadAssessment;
        a.RequiresDocChange = req.RequiresDocChange;
        a.RetrainingRequired = req.RetrainingRequired;
        a.BenefitsRealized = req.BenefitsRealized;
        a.RoleIntegrationScope = req.RoleIntegrationScope;
        a.NotesBenefits = req.NotesBenefits ?? "";
        a.NotesRealization = req.NotesRealization ?? "";
        a.NotesRoleIntegration = req.NotesRoleIntegration ?? "";
        a.NotesOther = req.NotesOther ?? "";

        // Replace benefits
        a.Benefits.Clear();
        for (int i = 0; i < Math.Min(3, req.Quantitative?.Length ?? 0); i++)
            a.Benefits.Add(new Benefit { Kind = BenefitKind.Quantitative, Order = (byte)(i + 1), Text = req.Quantitative![i] });

        for (int i = 0; i < Math.Min(3, req.Qualitative?.Length ?? 0); i++)
            a.Benefits.Add(new Benefit { Kind = BenefitKind.Qualitative, Order = (byte)(i + 1), Text = req.Qualitative![i] });

        if (p.Assessment is null) _db.Assessments.Add(a);

        p.UpdatedAtUtc = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return NoContent();
    }

    // GET /admin/projects/{id}/assessment
    [HttpGet("{id:guid}/assessment")]
    public async Task<ActionResult<AssessmentDto>> GetAssessment(Guid id, CancellationToken ct)
    {
        var a = await _db.Assessments.Include(x => x.Benefits).FirstOrDefaultAsync(x => x.ProjectId == id, ct);
        if (a is null) return NotFound();
        return Ok(_mapper.Map<AssessmentDto>(a));
    }
}
