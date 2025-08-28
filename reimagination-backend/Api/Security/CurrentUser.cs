using System.Security.Claims;

namespace Api.Security;

public interface ICurrentUser
{
    Guid UserId { get; }
    string Email { get; }
    string Name { get; }
    bool IsAdmin { get; }
}

public class CurrentUser : ICurrentUser
{
    public Guid UserId { get; }
    public string Email { get; }
    public string Name { get; }
    public bool IsAdmin { get; }

    public CurrentUser(ClaimsPrincipal user)
    {
        var sub = user.FindFirstValue("sub") ?? throw new InvalidOperationException("Missing sub claim");
        UserId = Guid.Parse(sub);
        Email = user.FindFirstValue("email") ?? "";
        Name = user.FindFirstValue("name") ?? "";
        IsAdmin = user.IsInRole("Admin");
    }
}
