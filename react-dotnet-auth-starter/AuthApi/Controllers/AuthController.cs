using AuthApi.DTOs;
using AuthApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AuthApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService auth, IConfiguration cfg) : ControllerBase
{
    private readonly int _refreshDays = cfg.GetSection("Jwt").GetValue<int>("RefreshTokenDays");

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var origin = $"{Request.Scheme}://{Request.Host}";
        var res = await auth.RegisterAsync(request, origin);
        return Ok(res);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var device = Request.Headers.UserAgent.ToString();
        var res = await auth.LoginAsync(request, ip, device);

        if (!string.IsNullOrEmpty(res.RefreshTokenPlain))
            SetRefreshCookie(res.RefreshTokenPlain);

        return Ok(res); // RefreshTokenPlain is [JsonIgnore] and won't be serialized
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh([FromBody] string? body = null)
    {
        var cookie = Request.Cookies["rtkn"];
        if (string.IsNullOrEmpty(cookie))
            return Unauthorized();

        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var device = Request.Headers.UserAgent.ToString();

        var res = await auth.RefreshAsync(cookie, ip, device);

        if (!string.IsNullOrEmpty(res.RefreshTokenPlain))
            SetRefreshCookie(res.RefreshTokenPlain);

        return Ok(res);
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var rt = Request.Cookies["rtkn"];
        if (!string.IsNullOrEmpty(rt))
            await auth.LogoutAsync(rt);

        Response.Cookies.Delete("rtkn", BuildCookieOptions(delete: true));
        return NoContent();
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest req)
    {
        var origin = $"{Request.Scheme}://{Request.Host}";
        await auth.SendForgotPasswordAsync(req, origin);
        return NoContent();
    }

    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(ResetPasswordRequest req)
    {
        await auth.ResetPasswordAsync(req);
        return NoContent();
    }

    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromQuery] string userId, [FromQuery] string token)
    {
        await auth.ConfirmEmailAsync(userId, token);
        return Content("Email confirmed. You can close this tab and sign in.");
    }

    private CookieOptions BuildCookieOptions(bool delete = false)
    {
        return new CookieOptions
        {
            HttpOnly = true,
            Secure = true, // set to false only on http dev
            SameSite = SameSiteMode.Lax,
            Expires = delete ? DateTimeOffset.UtcNow.AddDays(-1) : DateTimeOffset.UtcNow.AddDays(_refreshDays),
            Path = "/api/auth/refresh"
        };
    }

    private void SetRefreshCookie(string refreshTokenPlain)
    {
        Response.Cookies.Append("rtkn", refreshTokenPlain, BuildCookieOptions());
    }
}
