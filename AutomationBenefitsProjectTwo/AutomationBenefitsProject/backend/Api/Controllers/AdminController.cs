using Application.Projects;
using AutoMapper;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IMapper _map;

    public AdminController(AppDbContext db, IMapper map) { _db = db; _map = map; }

    [HttpGet("projects")]
    public async Task<IEnumerable<ProjectResponse>> All()
    {
        var rows = await _db.Projects.Include(x => x.Benefits).OrderByDescending(x => x.UpdatedAt).ToListAsync();
        return rows.Select(_map.Map<ProjectResponse>);
    }

    public record ReviewRequest(string? Comment);

    [HttpPost("projects/{id:guid}/approve")]
    public async Task<ActionResult> Approve(Guid id, [FromBody] ReviewRequest req)
    {
        var p = await _db.Projects.FirstOrDefaultAsync(x => x.Id == id);
        if (p == null) return NotFound();

        p.Status = ProjectStatus.Approved;
        if (!string.IsNullOrWhiteSpace(req.Comment))
            p.ReviewComments.Add(new ReviewComment { By = "Admin", Text = req.Comment! });
        p.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("projects/{id:guid}/request-changes")]
    public async Task<ActionResult> RequestChanges(Guid id, [FromBody] ReviewRequest req)
    {
        var p = await _db.Projects.FirstOrDefaultAsync(x => x.Id == id);
        if (p == null) return NotFound();

        p.Status = ProjectStatus.NeedsChanges;
        p.ReviewComments.Add(new ReviewComment { By = "Admin", Text = req.Comment ?? "Please address comments" });
        p.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
