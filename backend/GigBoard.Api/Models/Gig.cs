namespace GigBoard.Api.Models;

public class Gig
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Company { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public bool IsRemote { get; set; }
    public GigType Type { get; set; } = GigType.Contract;
    public string? HourlyRate { get; set; }
    public string? Duration { get; set; }
    public DateTime StartDate { get; set; }
    public List<string> Skills { get; set; } = new();
    public string? CompetenceArea { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ExpiresAt { get; set; }
    
    // Foreign keys
    public int PostedById { get; set; }
    public User PostedBy { get; set; } = null!;
    
    // Navigation
    public ICollection<Application> Applications { get; set; } = new List<Application>();
    public ICollection<Review> Reviews { get; set; } = new List<Review>();
}

public enum GigType
{
    Contract,
    Freelance,
    PartTime,
    FullTime
}

