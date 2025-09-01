using Application.Files;
using Application.Projects;
using AutoMapper;
using Domain.Entities;
using Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/projects")]
[Authorize(Roles = "User,Admin")]
public class ProjectsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IMapper _map;
    private readonly IFileStorage _files;

    public ProjectsController(AppDbContext db, IMapper map, IFileStorage files)
    {
        _db = db; _map = map; _files = files;
    }

    [HttpGet("mine")]
    public async Task<ActionResult<IEnumerable<ProjectResponse>>> MyProjects()
    {
        var uid = User.FindFirst("sub")?.Value ?? "";
        var rows = await _db.Projects
            .Where(p => p.RequesterUserId == uid)
            .Include(p => p.Benefits)
            .AsNoTracking()
            .ToListAsync();

        return rows.Select(_map.Map<ProjectResponse>).ToList();
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProjectResponse>> Get(Guid id)
    {
        var p = await _db.Projects.Include(x => x.Benefits).FirstOrDefaultAsync(x => x.Id == id);
        if (p == null) return NotFound();
        return _map.Map<ProjectResponse>(p);
    }

    [HttpPost]
    public async Task<ActionResult<ProjectResponse>> Create([FromBody] CreateProjectRequest req)
    {
        // Identity snapshot from JWT
        var uid = User.FindFirst("sub")?.Value ?? "";
        var name = User.FindFirst("name")?.Value ?? "";
        var email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value ?? "";

        var entity = _map.Map<Project>(req);
        entity.RequesterUserId = uid;
        entity.RequesterName = name;
        entity.RequesterEmail = email;
        entity.Status = ProjectStatus.Submitted;
        entity.CreatedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;

        _db.Projects.Add(entity);
        await _db.SaveChangesAsync();

        var result = _map.Map<ProjectResponse>(entity);
        return CreatedAtAction(nameof(Get), new { id = entity.Id }, result);
    }

    [HttpPost("{id:guid}/brd")]
    [RequestSizeLimit(100_000_000)] // 100MB
    public async Task<ActionResult> UploadBrd(Guid id, IFormFile file)
    {
        var p = await _db.Projects.FirstOrDefaultAsync(x => x.Id == id);
        if (p == null) return NotFound();
        if (file == null || file.Length == 0) return BadRequest("Empty file");

        await using var stream = file.OpenReadStream();
        var (path, savedName, contentType) = await _files.SaveAsync(stream, file.FileName, file.ContentType ?? "application/octet-stream");

        p.Brd ??= new Brd();
        p.Brd.FileName = savedName;
        p.Brd.ContentType = contentType;
        p.Brd.FilePath = path;
        p.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return NoContent();
    }
}
