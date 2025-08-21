namespace AuthApi.Domain;

public class RefreshToken
{
    public int Id { get; set; }
    public string TokenHash { get; set; } = default!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime ExpiresAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? ReplacedByTokenHash { get; set; }
    public string? Device { get; set; }
    public string? IpAddress { get; set; }

    public string AppUserId { get; set; } = default!;
    public AppUser AppUser { get; set; } = default!;
    public bool IsActive => RevokedAt == null && DateTime.UtcNow < ExpiresAt;
}
