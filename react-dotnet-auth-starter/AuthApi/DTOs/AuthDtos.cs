using System.Text.Json.Serialization;

namespace AuthApi.DTOs;

public record RegisterRequest(string Email, string Password, string FirstName, string LastName);
public record LoginRequest(string Email, string Password, bool RememberMe);
public record AuthResponse(string AccessToken, DateTime ExpiresAt, UserDto User)
{
    [JsonIgnore] public string? RefreshTokenPlain { get; init; } // used only by controller to set cookie
}
public record UserDto(string Id, string Email, string? FirstName, string? LastName, string[] Roles);

public record ForgotPasswordRequest(string Email);
public record ResetPasswordRequest(string Email, string Token, string NewPassword);
