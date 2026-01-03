namespace GigBoard.Api.Models;

public class User
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string? PasswordHash { get; set; } // Null for LinkedIn users
    public string FullName { get; set; } = string.Empty;
    
    // Account type
    public AccountType AccountType { get; set; } = AccountType.Personal;
    public UserRole Role { get; set; } = UserRole.Candidate;
    
    // Candidate type - for candidates only (freelance or through consulting firm)
    public CandidateType? CandidateType { get; set; }
    
    // LinkedIn data (auto-filled)
    public string? LinkedInId { get; set; }
    public string? LinkedInProfileUrl { get; set; }
    
    // Profile data (manual or from LinkedIn)
    public string? ProfilePictureUrl { get; set; }
    public string? Headline { get; set; } // Title/position
    public string? Summary { get; set; } // About me
    public string? Phone { get; set; }
    public string? Location { get; set; }
    
    // Company data (for Company accounts or ConsultingFirm candidates)
    public string? CompanyName { get; set; }
    public string? CompanyWebsite { get; set; }
    public string? OrganizationNumber { get; set; } // Organisationsnummer
    
    // Skills and experience
    public List<string> Skills { get; set; } = new();
    public int? YearsOfExperience { get; set; }
    public string? ResumeUrl { get; set; } // CV/Resume file
    
    // What the candidate is looking for
    public bool IsActivelyLooking { get; set; } = true; // Aktivt sökande
    public string? LookingFor { get; set; } // Vad de söker (t.ex. "Backend-utveckling inom fintech")
    public List<string> PreferredGigTypes { get; set; } = new(); // Contract, Freelance, PartTime, FullTime
    public string? Availability { get; set; } // t.ex. "Tillgänglig från mars 2026", "Omgående"
    
    // Timestamps
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? LastLoginAt { get; set; }
    
    // Navigation
    public ICollection<Gig> PostedGigs { get; set; } = new List<Gig>();
    public ICollection<Application> Applications { get; set; } = new List<Application>();
    public ICollection<Review> ReceivedReviews { get; set; } = new List<Review>();
    public ICollection<Review> GivenReviews { get; set; } = new List<Review>();
}

public enum AccountType
{
    Personal,   // Individual candidate
    Company,    // Company that posts gigs (employer)
    Employer    // Posts gigs only (alias for clarity)
}

public enum UserRole
{
    Candidate,  // Can apply to gigs
    Employer,   // Can post gigs
    Admin       // Full access
}

public enum CandidateType
{
    Freelance,      // Egenföretagare/frilansare
    ConsultingFirm  // Anställd hos konsultbolag (CGI, Capgemini, etc.)
}
