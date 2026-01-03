namespace GigBoard.Api.DTOs;

// Create a new review
public record CreateReviewRequest(
    int CandidateId,
    int GigId,  // Required - must have an accepted application for this gig
    int Rating, // 1-5 stars
    string? Comment
);

// Review response
public record ReviewResponse(
    int Id,
    int Rating,
    string? Comment,
    DateTime CreatedAt,
    ReviewerInfo Reviewer,
    GigInfo? Gig
);

// Reviewer info (employer who gave the review)
public record ReviewerInfo(
    int Id,
    string FullName,
    string? CompanyName,
    string? ProfilePictureUrl
);

// Gig info for the review context
public record GigInfo(
    int Id,
    string Title,
    string? CompanyName
);

// Candidate reviews summary with full profile info
public record CandidateReviewsSummary(
    int CandidateId,
    string FullName,
    string? ProfilePictureUrl,
    string? Headline,
    string? CompanyName,
    string? CandidateType,
    double AverageRating,
    int TotalReviews,
    int CompletedGigsCount,
    List<ReviewResponse> Reviews,
    // Extended profile info
    string? Summary,
    string? Location,
    List<string> Skills,
    int? YearsOfExperience,
    string? LinkedInProfileUrl,
    // What they're looking for
    bool IsActivelyLooking,
    string? LookingFor,
    List<string> PreferredGigTypes,
    string? Availability
);

// Check if can review
public record CanReviewResponse(
    bool CanReview,
    bool HasAlreadyReviewed,
    string? Message
);

