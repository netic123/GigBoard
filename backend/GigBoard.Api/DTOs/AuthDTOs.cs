namespace GigBoard.Api.DTOs;

// Registration - Personal account
public record RegisterPersonalRequest(
    string Email,
    string Password,
    string FullName,
    string? Phone,
    string? Location,
    string? Headline,
    string? Summary,
    List<string>? Skills,
    int? YearsOfExperience,
    string? ProfilePictureUrl
);

// Registration - Company account (consulting firm)
public record RegisterCompanyRequest(
    string Email,
    string Password,
    string FullName,
    string CompanyName,
    string? OrganizationNumber,
    string? CompanyWebsite,
    string? Phone,
    string? Location,
    string? Headline,
    string? Summary
);

// Registration - Employer (posts gigs)
public record RegisterEmployerRequest(
    string Email,
    string Password,
    string FullName,
    string CompanyName,
    string? OrganizationNumber,
    string? CompanyWebsite,
    string? Phone,
    string? ProfilePictureUrl
);

// Login
public record LoginRequest(string Email, string Password);

// Auth response
public record AuthResponse(
    string Token,
    UserResponse User
);

// User response
public record UserResponse(
    int Id,
    string Email,
    string FullName,
    string? ProfilePictureUrl,
    string? Headline,
    string? Summary,
    string? Phone,
    string? Location,
    string? CompanyName,
    string? CompanyWebsite,
    string? LinkedInProfileUrl,
    List<string> Skills,
    int? YearsOfExperience,
    string AccountType,
    string Role
);

// Update profile
public record UpdateProfileRequest(
    string? FullName,
    string? Headline,
    string? Summary,
    string? Phone,
    string? Location,
    string? CompanyName,
    string? CompanyWebsite,
    string? ProfilePictureUrl,
    List<string>? Skills,
    int? YearsOfExperience
);

// LinkedIn auth
public record LinkedInAuthRequest(string Code, string RedirectUri);

public record LinkedInAuthResponse(
    bool IsNewUser,
    string? Token,
    UserResponse? User,
    LinkedInProfileData? LinkedInData
);

public record LinkedInProfileData(
    string LinkedInId,
    string Email,
    string FullName,
    string? FirstName,
    string? LastName,
    string? ProfilePictureUrl,
    string? ProfileUrl
);

public record RegisterWithLinkedInRequest(
    string LinkedInId,
    string Email,
    string FullName,
    string? LinkedInProfileUrl,
    string? ProfilePictureUrl,
    string? Phone,
    string? Location,
    string? Headline,
    string? Summary,
    List<string>? Skills,
    int? YearsOfExperience,
    string? CompanyName,
    string? CandidateType
);