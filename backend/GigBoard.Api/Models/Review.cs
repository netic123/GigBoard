namespace GigBoard.Api.Models;

public class Review
{
    public int Id { get; set; }
    public int Rating { get; set; } // 1-5 stars
    public string? Comment { get; set; } // Optional review text
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    // Foreign keys
    public int ReviewerId { get; set; } // The employer giving the review
    public User Reviewer { get; set; } = null!;
    
    public int CandidateId { get; set; } // The candidate receiving the review
    public User Candidate { get; set; } = null!;
    
    public int? GigId { get; set; } // Related gig (optional)
    public Gig? Gig { get; set; }
}

