using Infrastructure.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;

namespace Api.Controllers.v1;

[ApiController]
[ApiVersion("1.0")]
[Route("api/v{version:apiVersion}/auth")]
public class AuthController : ControllerBase
{
    private readonly SignInManager<ApplicationUser> _signIn;
    private readonly UserManager<ApplicationUser> _users;
    private readonly JwtTokenService _jwt;

    public AuthController(SignInManager<ApplicationUser> signIn, UserManager<ApplicationUser> users, JwtTokenService jwt)
    {
        _signIn = signIn; _users = users; _jwt = jwt;
    }

    public record LoginRequest(string Email, string Password);
    public record LoginResponse(string AccessToken, string TokenType, DateTime ExpiresAtUtc, string[] Roles);

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest req)
    {
        var user = await _users.FindByEmailAsync(req.Email);
        if (user is null) return Unauthorized(new { message = "Invalid credentials" });

        var check = await _signIn.CheckPasswordSignInAsync(user, req.Password, lockoutOnFailure: false);
        if (!check.Succeeded) return Unauthorized(new { message = "Invalid credentials" });

        var roles = (await _users.GetRolesAsync(user)).ToArray();
        var token = _jwt.CreateToken(user, roles);
        return Ok(new LoginResponse(token, "Bearer", DateTime.UtcNow.AddHours(2), roles));
    }

    public record RegisterRequest(string Email, string Password, string Role);

    [HttpPost("register")]
    [Authorize(Roles = "Admin")] // keep admin-only in prod
    public async Task<ActionResult> Register(RegisterRequest req)
    {
        var user = new ApplicationUser { UserName = req.Email, Email = req.Email, EmailConfirmed = true };
        var result = await _users.CreateAsync(user, req.Password);
        if (!result.Succeeded) return BadRequest(result.Errors);

        if (!string.IsNullOrWhiteSpace(req.Role))
            await _users.AddToRoleAsync(user, req.Role);

        return CreatedAtAction(nameof(Login), new { email = user.Email }, new { user.Id, user.Email });
    }
}
