using AuthApi.Data;
using AuthApi.Domain;
using AuthApi.DTOs;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace AuthApi.Services;

public class AuthService(
    AppDbContext db,
    UserManager<AppUser> userMgr,
    SignInManager<AppUser> signInMgr,
    RoleManager<IdentityRole> roleMgr,
    ITokenService tokens,
    IEmailSender email) : IAuthService
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest req, string origin)
    {
        var user = new AppUser
        {
            UserName = req.Email,
            Email = req.Email,
            FirstName = req.FirstName,
            LastName = req.LastName
        };

        var result = await userMgr.CreateAsync(user, req.Password);
        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join(" | ", result.Errors.Select(e => e.Description)));

        if (!await roleMgr.RoleExistsAsync("User"))
            await roleMgr.CreateAsync(new IdentityRole("User"));
        await userMgr.AddToRoleAsync(user, "User");

        var token = await userMgr.GenerateEmailConfirmationTokenAsync(user);
        var confirmUrl = $"{origin}/verify-email?userId={Uri.EscapeDataString(user.Id)}&token={Uri.EscapeDataString(token)}";
        await email.SendAsync(user.Email!, "Confirm your email", $"Click <a href=\"{confirmUrl}\">here</a> to confirm.");

        var roles = await userMgr.GetRolesAsync(user);
        var (access, exp) = tokens.CreateAccessToken(user, roles);
        return new AuthResponse(access, exp, new UserDto(user.Id, user.Email!, user.FirstName, user.LastName, [..roles]));
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest req, string ip, string? device)
    {
        var user = await userMgr.Users.Include(u => u.RefreshTokens)
                        .FirstOrDefaultAsync(u => u.Email == req.Email);
        if (user is null)
            throw new UnauthorizedAccessException("Invalid credentials.");

        if (!await userMgr.IsEmailConfirmedAsync(user))
            throw new UnauthorizedAccessException("Email not confirmed.");

        var result = await signInMgr.CheckPasswordSignInAsync(user, req.Password, lockoutOnFailure: true);
        if (!result.Succeeded)
            throw new UnauthorizedAccessException("Invalid credentials.");

        var roles = await userMgr.GetRolesAsync(user);
        var (access, exp) = tokens.CreateAccessToken(user, roles);

        var (rtPlain, rtHash, rtExp) = tokens.CreateRefreshToken();
        user.RefreshTokens.Add(new RefreshToken
        {
            TokenHash = rtHash,
            ExpiresAt = rtExp,
            IpAddress = ip,
            Device = device
        });
        await db.SaveChangesAsync();

        return new AuthResponse(access, exp, new UserDto(user.Id, user.Email!, user.FirstName, user.LastName, [..roles]))
        {
            RefreshTokenPlain = rtPlain
        };
    }

    public async Task<AuthResponse> RefreshAsync(string refreshTokenPlain, string ip, string? device)
    {
        var hash = tokens.Hash(refreshTokenPlain);
        var rt = await db.RefreshTokens.Include(r => r.AppUser)
                    .FirstOrDefaultAsync(r => r.TokenHash == hash);

        if (rt is null || !rt.IsActive)
            throw new UnauthorizedAccessException("Invalid refresh token.");

        var (newPlain, newHash, newExp) = tokens.CreateRefreshToken();
        rt.RevokedAt = DateTime.UtcNow;
        rt.ReplacedByTokenHash = newHash;

        var newRt = new RefreshToken
        {
            AppUserId = rt.AppUserId,
            TokenHash = newHash,
            ExpiresAt = newExp,
            IpAddress = ip,
            Device = device
        };
        db.RefreshTokens.Add(newRt);
        await db.SaveChangesAsync();

        var user = rt.AppUser;
        var roles = await userMgr.GetRolesAsync(user);
        var (access, exp) = tokens.CreateAccessToken(user, roles);

        return new AuthResponse(access, exp, new UserDto(user.Id, user.Email!, user.FirstName, user.LastName, [..roles]))
        {
            RefreshTokenPlain = newPlain
        };
    }

    public async Task LogoutAsync(string refreshTokenPlain)
    {
        var hash = tokens.Hash(refreshTokenPlain);
        var rt = await db.RefreshTokens.FirstOrDefaultAsync(r => r.TokenHash == hash);
        if (rt != null && rt.RevokedAt == null)
        {
            rt.RevokedAt = DateTime.UtcNow;
            await db.SaveChangesAsync();
        }
    }

    public async Task SendForgotPasswordAsync(ForgotPasswordRequest req, string origin)
    {
        var user = await userMgr.FindByEmailAsync(req.Email);
        if (user is null) return;

        var token = await userMgr.GeneratePasswordResetTokenAsync(user);
        var resetUrl = $"{origin}/reset-password?email={Uri.EscapeDataString(user.Email!)}&token={Uri.EscapeDataString(token)}";
        await email.SendAsync(user.Email!, "Reset your password", $"Reset it <a href=\"{resetUrl}\">here</a>.");
    }

    public async Task ConfirmEmailAsync(string userId, string token)
    {
        var user = await userMgr.FindByIdAsync(userId) ?? throw new InvalidOperationException("User not found");
        var res = await userMgr.ConfirmEmailAsync(user, token);
        if (!res.Succeeded)
            throw new InvalidOperationException("Invalid confirmation token.");
    }

    public async Task ResetPasswordAsync(ResetPasswordRequest req)
    {
        var user = await userMgr.FindByEmailAsync(req.Email) ?? throw new InvalidOperationException("User not found");
        var res = await userMgr.ResetPasswordAsync(user, req.Token, req.NewPassword);
        if (!res.Succeeded)
            throw new InvalidOperationException(string.Join(" | ", res.Errors.Select(e => e.Description)));
    }
}
