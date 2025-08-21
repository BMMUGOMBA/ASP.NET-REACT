using Microsoft.AspNetCore.Identity;

namespace AuthApi.Domain;

public class AppUser : IdentityUser
{
    public string? FirstName { get; set; }
    public string? LastName  { get; set; }

    public List<RefreshToken> RefreshTokens { get; set; } = new();
}
