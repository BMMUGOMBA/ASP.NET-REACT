using System.Security.Claims;
using AuthApi.Data;
using AuthApi.DTOs;
using AuthApi.Models;
using AuthApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AuthApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly SignInManager<ApplicationUser> _signInManager;
    private readonly TokenService _tokenService;
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    public AuthController(
        UserManager<ApplicationUser> userManager,
        SignInManager<ApplicationUser> signInManager,
        TokenService tokenService,
        AppDbContext db,
        IConfiguration config)
    {
        _userManager = userManager;
        _signInManager = signInManager;
        _tokenService = tokenService;
        _db = db;
        _config = config;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest req)
    {
        var existing = await _userManager.FindByEmailAsync(req.Email);
        if (existing != null) return BadRequest(new { message = "Email already registered" });

        var user = new ApplicationUser { UserName = req.Email, Email = req.Email };
        var result = await _userManager.CreateAsync(user, req.Password);
        if (!result.Succeeded) return BadRequest(result.Errors);

        return await IssueTokensAsync(user);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest req)
    {
        var user = await _userManager.Users.FirstOrDefaultAsync(u => u.Email == req.Email);
        if (user == null) return Unauthorized(new { message = "Invalid credentials" });

        var pass = await _signInManager.CheckPasswordSignInAsync(user, req.Password, lockoutOnFailure: true);
        if (!pass.Succeeded) return Unauthorized(new { message = "Invalid credentials" });

        return await IssueTokensAsync(user);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh()
    {
        var cookie = Request.Cookies["rt"];
        if (string.IsNullOrEmpty(cookie)) return Unauthorized();

        var hash = TokenService.HashRefreshToken(cookie);
        var entity = await _db.RefreshTokens.FirstOrDefaultAsync(r =>
            r.TokenHash == hash && r.RevokedAtUtc == null);

        if (entity == null || entity.ExpiresAtUtc < DateTime.UtcNow)
            return Unauthorized();

        var user = await _userManager.FindByIdAsync(entity.UserId);
        if (user == null) return Unauthorized();

        // rotate token: revoke old; issue & store new
        entity.RevokedAtUtc = DateTime.UtcNow;
        var (newRt, newHash) = _tokenService.CreateRefreshTokenRawAndHash();
        entity.ReplacedByTokenHash = newHash;
        await _db.SaveChangesAsync();

        await _tokenService.StoreRefreshTokenAsync(user, newHash,
            userAgent: Request.Headers.UserAgent.ToString(),
            ip: HttpContext.Connection.RemoteIpAddress?.ToString());

        SetRefreshCookie(newRt);
        return await IssueAccessOnlyAsync(user);
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<AuthUser>> Me()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub");
        if (userId == null) return Unauthorized();

        var user = await _userManager.FindByIdAsync(userId);
        if (user == null) return Unauthorized();

        return new AuthUser(user.Id, user.Email ?? "");
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var cookie = Request.Cookies["rt"];
        if (!string.IsNullOrEmpty(cookie))
        {
            var hash = TokenService.HashRefreshToken(cookie);
            var entity = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.TokenHash == hash && r.RevokedAtUtc == null);
            if (entity != null)
            {
                entity.RevokedAtUtc = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }
        Response.Cookies.Delete("rt");
        return NoContent();
    }

    // === helpers ===
    private async Task<AuthResponse> IssueTokensAsync(ApplicationUser user)
    {
        var (jwt, exp) = await _tokenService.CreateAccessTokenAsync(user);
        var roles = (await _userManager.GetRolesAsync(user)).ToArray();

        var (rt, rtHash) = _tokenService.CreateRefreshTokenRawAndHash();
        await _tokenService.StoreRefreshTokenAsync(user, rtHash,
            userAgent: Request.Headers.UserAgent.ToString(),
            ip: HttpContext.Connection.RemoteIpAddress?.ToString());

        SetRefreshCookie(rt);

        return new AuthResponse(jwt, (int)(exp - DateTime.UtcNow).TotalSeconds,
            new AuthUser(user.Id, user.Email ?? ""), roles);
    }

    private async Task<AuthResponse> IssueAccessOnlyAsync(ApplicationUser user)
    {
        var (jwt, exp) = await _tokenService.CreateAccessTokenAsync(user);
        var roles = (await _userManager.GetRolesAsync(user)).ToArray();

        return new AuthResponse(jwt, (int)(exp - DateTime.UtcNow).TotalSeconds,
            new AuthUser(user.Id, user.Email ?? ""), roles);
    }

    private void SetRefreshCookie(string token)
    {
        // Using HTTPS in dev (dotnet dev-certs https --trust); keep Secure=true.
        var cookieOptions = new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax, // Lax is ok for same-site form posts. Use None for cross-site if needed (requires Secure).
            Expires = DateTimeOffset.UtcNow.AddDays(int.Parse(_config["Jwt:RefreshTokenLifetimeDays"]!)),
            Path = "/api/auth"
        };
        Response.Cookies.Append("rt", token, cookieOptions);
    }
}
