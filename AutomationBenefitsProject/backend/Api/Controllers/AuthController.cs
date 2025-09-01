using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly UserManager<AppUser> _userMgr;
    private readonly IConfiguration _cfg;

    public AuthController(UserManager<AppUser> userMgr, IConfiguration cfg)
    {
        _userMgr = userMgr; _cfg = cfg;
    }

    public record LoginRequest(string Email, string Password);
    public record LoginResponse(string Token, string Name, string Email, string Role);

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromBody] LoginRequest req)
    {
        var user = await _userMgr.FindByEmailAsync(req.Email);
        if (user == null || !(await _userMgr.CheckPasswordAsync(user, req.Password)))
            return Unauthorized();

        var roles = await _userMgr.GetRolesAsync(user);
        var role = roles.FirstOrDefault() ?? "User";

        var token = CreateToken(user, role);
        return new LoginResponse(token, user.DisplayName ?? user.UserName!, user.Email!, role);
    }

    private string CreateToken(AppUser user, string role)
    {
        var jwt = _cfg.GetSection("Jwt");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Email, user.Email ?? ""),
            new(ClaimTypes.Role, role),
            new("name", user.DisplayName ?? user.UserName ?? "")
        };

        var t = new JwtSecurityToken(
            issuer: jwt["Issuer"], audience: jwt["Audience"],
            claims: claims, expires: DateTime.UtcNow.AddHours(8), signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(t);
    }
}
