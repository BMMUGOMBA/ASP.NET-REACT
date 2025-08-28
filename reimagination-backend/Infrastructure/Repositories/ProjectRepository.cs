using Domain.Entities;
using Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Repositories;

public class ProjectRepository : IProjectRepository
{
    private readonly AppDbContext _db;
    public ProjectRepository(AppDbContext db) => _db = db;

    public IQueryable<Project> Query() => _db.Projects.AsNoTracking();

    public Task<Project?> GetAsync(Guid id, CancellationToken ct) =>
        _db.Projects
           .Include(p => p.Assessment)
           .ThenInclude(a => a!.Benefits)
           .FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<Project> AddAsync(Project project, CancellationToken ct)
    {
        _db.Projects.Add(project);
        await _db.SaveChangesAsync(ct);
        return project;
    }

    public Task SaveChangesAsync(CancellationToken ct) => _db.SaveChangesAsync(ct);
}
