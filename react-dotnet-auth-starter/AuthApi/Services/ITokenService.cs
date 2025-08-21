using AuthApi.Domain;

namespace AuthApi.Services;

public interface ITokenService
{
    (string token, DateTime expiresAt) CreateAccessToken(AppUser user, IEnumerable<string> roles);
    (string refreshTokenPlain, string refreshTokenHash, DateTime expiresAt) CreateRefreshToken();
    string Hash(string value);
}
