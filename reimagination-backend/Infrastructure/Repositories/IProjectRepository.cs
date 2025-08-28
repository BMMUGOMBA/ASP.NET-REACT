using Domain.Entities;

namespace Infrastructure.Repositories;

public interface IProjectRepository
{
    Task<Project?> GetAsync(Guid id, CancellationToken ct);
    Task<Project> AddAsync(Project project, CancellationToken ct);
    Task SaveChangesAsync(CancellationToken ct);
    IQueryable<Project> Query(); // for filtering/paging
}
