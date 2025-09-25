namespace AuthApi.Models;

public class RefreshToken
{
    public int Id { get; set; }
    public string UserId { get; set; } = default!;
    public string TokenHash { get; set; } = default!;
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAtUtc { get; set; }
    public string? ReplacedByTokenHash { get; set; }
    public string? UserAgent { get; set; }
    public string? IpAddress { get; set; }
}
