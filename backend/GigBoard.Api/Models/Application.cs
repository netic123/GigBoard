namespace GigBoard.Api.Models;

public class Application
{
    public int Id { get; set; }
    public string? Message { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
    public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign keys
    public int GigId { get; set; }
    public Gig Gig { get; set; } = null!;
    
    public int ApplicantId { get; set; }
    public User Applicant { get; set; } = null!;
}

public enum ApplicationStatus
{
    Pending,
    Reviewed,
    Accepted,
    Rejected
}

