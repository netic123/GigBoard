namespace GigBoard.Api.DTOs;

public record LeaderboardEntryDto(
    int UserId,
    string FullName,
    string? ProfilePictureUrl,
    string? Headline,
    string? CompanyName,
    string CandidateType,
    int CompletedGigsCount,
    double AverageRating,
    int TotalReviews,
    List<string> TopSkills,
    bool IsActivelyLooking,
    string? Availability
);

public record LeaderboardResponseDto(
    List<LeaderboardEntryDto> TopCandidates,
    int TotalCandidates
);

