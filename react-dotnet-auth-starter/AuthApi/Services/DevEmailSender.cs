namespace AuthApi.Services;

public class DevEmailSender : IEmailSender
{
    private readonly ILogger<DevEmailSender> _logger;
    public DevEmailSender(ILogger<DevEmailSender> logger) => _logger = logger;

    public Task SendAsync(string to, string subject, string htmlBody)
    {
        _logger.LogInformation("DEV EMAIL to: {to}\nSubject: {s}\nBody:\n{b}", to, subject, htmlBody);
        return Task.CompletedTask;
    }
}
