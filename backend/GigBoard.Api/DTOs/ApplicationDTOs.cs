using GigBoard.Api.Models;

namespace GigBoard.Api.DTOs;

public record ApplyRequest(string? Message);

public record ApplicationResponse(
    int Id,
    string? Message,
    string Status,
    DateTime AppliedAt,
    ApplicantResponse Applicant,
    GigSummaryResponse Gig
);

public record ApplicantResponse(
    int Id,
    string FullName,
    string Email,
    string? ProfilePictureUrl,
    string? Headline,
    string? LinkedInProfileUrl,
    string? CompanyName,
    string? Phone,
    string? Location,
    List<string> Skills,
    int? YearsOfExperience,
    string AccountType
);

public record GigSummaryResponse(
    int Id,
    string Title,
    string Company,
    string Location
);
