using AuthApi.DTOs;

namespace AuthApi.Services;

public interface IAuthService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest request, string origin);
    Task<AuthResponse> LoginAsync(LoginRequest request, string ip, string? device);
    Task<AuthResponse> RefreshAsync(string refreshTokenPlain, string ip, string? device);
    Task LogoutAsync(string refreshTokenPlain);
    Task SendForgotPasswordAsync(ForgotPasswordRequest request, string origin);
    Task ConfirmEmailAsync(string userId, string token);
    Task ResetPasswordAsync(ResetPasswordRequest request);
}
