namespace AuthApi.DTOs;

public record RegisterRequest(string Email, string Password);
public record LoginRequest(string Email, string Password);

public record AuthUser(string Id, string Email);
public record AuthResponse(string AccessToken, int ExpiresInSeconds, AuthUser User, string[] Roles);
