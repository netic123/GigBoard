using GigBoard.Api.Models;

namespace GigBoard.Api.DTOs;

// Request DTOs
public record CreateGigRequest(
    string Title,
    string Description,
    string Company,
    string Location,
    bool IsRemote,
    GigType Type,
    string? HourlyRate,
    string? Duration,
    DateTime StartDate,
    List<string> Skills,
    string? CompetenceArea,
    DateTime? ExpiresAt
);

public record UpdateGigRequest(
    string? Title,
    string? Description,
    string? Location,
    bool? IsRemote,
    GigType? Type,
    string? HourlyRate,
    string? Duration,
    DateTime? StartDate,
    List<string>? Skills,
    string? CompetenceArea,
    bool? IsActive,
    DateTime? ExpiresAt
);

// Response DTOs
public record GigResponse(
    int Id,
    string Title,
    string Description,
    string Company,
    string Location,
    bool IsRemote,
    string Type,
    string? HourlyRate,
    string? Duration,
    DateTime StartDate,
    List<string> Skills,
    string? CompetenceArea,
    bool IsActive,
    DateTime CreatedAt,
    DateTime? ExpiresAt,
    int ApplicationCount,
    GigPosterResponse PostedBy
);

public record GigPosterResponse(
    int Id,
    string FullName,
    string? ProfilePictureUrl
);

public record GigListResponse(
    List<GigResponse> Gigs,
    int TotalCount,
    int Page,
    int PageSize
);

