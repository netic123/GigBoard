using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using GigBoard.Api.Models;

namespace GigBoard.Api.Services;

public interface IEmailService
{
    Task SendApplicationNotification(Gig gig, User applicant, string? message);
}

public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;
    
    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }
    
    public async Task SendApplicationNotification(Gig gig, User applicant, string? message)
    {
        var smtpHost = _config["Smtp:Host"];
        var smtpPort = int.Parse(_config["Smtp:Port"] ?? "587");
        var smtpUser = _config["Smtp:User"];
        var smtpPass = _config["Smtp:Password"];
        var fromEmail = _config["Smtp:From"];
        
        if (string.IsNullOrEmpty(smtpHost))
        {
            _logger.LogWarning("SMTP not configured, skipping email notification");
            return;
        }
        
        var email = new MimeMessage();
        email.From.Add(MailboxAddress.Parse(fromEmail));
        email.To.Add(MailboxAddress.Parse(gig.PostedBy.Email));
        email.Subject = $"Ny ansökan till: {gig.Title}";
        
        var linkedInLink = !string.IsNullOrEmpty(applicant.LinkedInProfileUrl)
            ? $"<p><a href=\"{applicant.LinkedInProfileUrl}\">Se LinkedIn-profil</a></p>"
            : "";
            
        var messageSection = !string.IsNullOrEmpty(message)
            ? $"<h3>Meddelande från sökanden:</h3><p>{message}</p>"
            : "";
        
        email.Body = new TextPart(MimeKit.Text.TextFormat.Html)
        {
            Text = $@"
                <html>
                <body style='font-family: system-ui, sans-serif; padding: 20px; background: #000; color: #fff;'>
                    <div style='max-width: 600px; margin: 0 auto; background: #111; padding: 30px; border-radius: 8px;'>
                        <h1 style='color: #fff; margin-bottom: 20px;'>Ny ansökan!</h1>
                        <p>Du har fått en ny ansökan till uppdraget <strong>{gig.Title}</strong>.</p>
                        
                        <h2 style='color: #fff; margin-top: 30px;'>Om sökanden</h2>
                        <p><strong>Namn:</strong> {applicant.FullName}</p>
                        <p><strong>Email:</strong> {applicant.Email}</p>
                        {(applicant.Headline != null ? $"<p><strong>Titel:</strong> {applicant.Headline}</p>" : "")}
                        {linkedInLink}
                        
                        {messageSection}
                        
                        <hr style='border: 1px solid #333; margin: 30px 0;' />
                        <p style='color: #666; font-size: 14px;'>
                            Detta mail skickades från GigBoard.
                        </p>
                    </div>
                </body>
                </html>
            "
        };
        
        try
        {
            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);
            
            if (!string.IsNullOrEmpty(smtpUser))
            {
                await smtp.AuthenticateAsync(smtpUser, smtpPass);
            }
            
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
            
            _logger.LogInformation("Sent application notification to {Email}", gig.PostedBy.Email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email notification");
        }
    }
}

