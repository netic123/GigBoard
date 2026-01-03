using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using GigBoard.Api.Data;
using GigBoard.Api.DTOs;
using GigBoard.Api.Models;
using GigBoard.Api.Services;

namespace GigBoard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IJwtService _jwt;
    private readonly ILinkedInService _linkedIn;
    
    public AuthController(AppDbContext db, IJwtService jwt, ILinkedInService linkedIn)
    {
        _db = db;
        _jwt = jwt;
        _linkedIn = linkedIn;
    }
    
    // LinkedIn OAuth callback - login existing user or return data for registration
    [HttpPost("linkedin")]
    public async Task<ActionResult<LinkedInAuthResponse>> LinkedInAuth([FromBody] LinkedInAuthRequest request)
    {
        // Exchange code for token
        var tokenResponse = await _linkedIn.ExchangeCodeForToken(request.Code, request.RedirectUri);
        if (tokenResponse == null)
            return BadRequest(new { error = "Failed to authenticate with LinkedIn" });
        
        // Get user info
        var userInfo = await _linkedIn.GetUserInfo(tokenResponse.access_token);
        if (userInfo == null)
            return BadRequest(new { error = "Failed to get user info from LinkedIn" });
        
        // Check if user exists by LinkedIn ID
        var user = await _db.Users.FirstOrDefaultAsync(u => u.LinkedInId == userInfo.sub);
        
        if (user != null)
        {
            // Existing LinkedIn user - update profile picture and login
            user.ProfilePictureUrl = userInfo.picture ?? user.ProfilePictureUrl;
            user.LastLoginAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            
            var token = _jwt.GenerateToken(user);
            return Ok(new LinkedInAuthResponse(
                IsNewUser: false,
                Token: token,
                User: MapToUserResponse(user),
                LinkedInData: null
            ));
        }
        
        // Check if email exists (user registered with email but not LinkedIn)
        user = await _db.Users.FirstOrDefaultAsync(u => u.Email == userInfo.email);
        
        if (user != null)
        {
            // Link LinkedIn to existing account
            user.LinkedInId = userInfo.sub;
            user.LinkedInProfileUrl = $"https://www.linkedin.com/in/{userInfo.sub}";
            user.ProfilePictureUrl = userInfo.picture ?? user.ProfilePictureUrl;
            user.LastLoginAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            
            var token = _jwt.GenerateToken(user);
            return Ok(new LinkedInAuthResponse(
                IsNewUser: false,
                Token: token,
                User: MapToUserResponse(user),
                LinkedInData: null
            ));
        }
        
        // New user - return LinkedIn data for registration form
        return Ok(new LinkedInAuthResponse(
            IsNewUser: true,
            Token: null,
            User: null,
            LinkedInData: new LinkedInProfileData(
                LinkedInId: userInfo.sub,
                Email: userInfo.email,
                FullName: userInfo.name,
                FirstName: userInfo.given_name,
                LastName: userInfo.family_name,
                ProfilePictureUrl: userInfo.picture,
                ProfileUrl: $"https://www.linkedin.com/in/{userInfo.sub}"
            )
        ));
    }
    
    // Complete registration with LinkedIn data
    [HttpPost("register/linkedin")]
    public async Task<ActionResult<AuthResponse>> RegisterWithLinkedIn([FromBody] RegisterWithLinkedInRequest request)
    {
        // Check if email already exists
        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest(new { error = "E-postadressen är redan registrerad" });
        
        // Check if LinkedIn ID already exists
        if (await _db.Users.AnyAsync(u => u.LinkedInId == request.LinkedInId))
            return BadRequest(new { error = "Detta LinkedIn-konto är redan kopplat till ett konto" });
        
        var user = new User
        {
            Email = request.Email,
            FullName = request.FullName,
            LinkedInId = request.LinkedInId,
            LinkedInProfileUrl = request.LinkedInProfileUrl,
            ProfilePictureUrl = request.ProfilePictureUrl,
            Phone = request.Phone,
            Location = request.Location,
            Headline = request.Headline,
            Summary = request.Summary,
            Skills = request.Skills ?? new List<string>(),
            YearsOfExperience = request.YearsOfExperience,
            CompanyName = request.CompanyName,
            CandidateType = request.CandidateType != null 
                ? Enum.Parse<CandidateType>(request.CandidateType) 
                : Models.CandidateType.Freelance,
            AccountType = AccountType.Personal,
            Role = UserRole.Candidate
        };
        
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        
        var token = _jwt.GenerateToken(user);
        
        return Ok(new AuthResponse(token, MapToUserResponse(user)));
    }
    
    // Register personal account (individual candidate)
    [HttpPost("register/personal")]
    public async Task<ActionResult<AuthResponse>> RegisterPersonal([FromBody] RegisterPersonalRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest(new { error = "E-postadressen är redan registrerad" });
        
        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName,
            Phone = request.Phone,
            Location = request.Location,
            Headline = request.Headline,
            Summary = request.Summary,
            Skills = request.Skills ?? new List<string>(),
            YearsOfExperience = request.YearsOfExperience,
            AccountType = AccountType.Personal,
            Role = UserRole.Candidate
        };
        
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        
        var token = _jwt.GenerateToken(user);
        
        return Ok(new AuthResponse(token, MapToUserResponse(user)));
    }
    
    // Register company account (consulting firm that can apply)
    [HttpPost("register/company")]
    public async Task<ActionResult<AuthResponse>> RegisterCompany([FromBody] RegisterCompanyRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest(new { error = "E-postadressen är redan registrerad" });
        
        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName,
            CompanyName = request.CompanyName,
            OrganizationNumber = request.OrganizationNumber,
            CompanyWebsite = request.CompanyWebsite,
            Phone = request.Phone,
            Location = request.Location,
            Headline = request.Headline,
            Summary = request.Summary,
            AccountType = AccountType.Company,
            Role = UserRole.Candidate
        };
        
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        
        var token = _jwt.GenerateToken(user);
        
        return Ok(new AuthResponse(token, MapToUserResponse(user)));
    }
    
    // Register employer (posts gigs only)
    [HttpPost("register/employer")]
    public async Task<ActionResult<AuthResponse>> RegisterEmployer([FromBody] RegisterEmployerRequest request)
    {
        if (await _db.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest(new { error = "E-postadressen är redan registrerad" });
        
        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            FullName = request.FullName,
            CompanyName = request.CompanyName,
            OrganizationNumber = request.OrganizationNumber,
            CompanyWebsite = request.CompanyWebsite,
            Phone = request.Phone,
            AccountType = AccountType.Employer,
            Role = UserRole.Employer
        };
        
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        
        var token = _jwt.GenerateToken(user);
        
        return Ok(new AuthResponse(token, MapToUserResponse(user)));
    }
    
    // Traditional login
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        
        if (user == null || string.IsNullOrEmpty(user.PasswordHash))
            return Unauthorized(new { error = "Felaktiga inloggningsuppgifter" });
        
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized(new { error = "Felaktiga inloggningsuppgifter" });
        
        user.LastLoginAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        
        var token = _jwt.GenerateToken(user);
        
        return Ok(new AuthResponse(token, MapToUserResponse(user)));
    }
    
    // Get current user
    [Authorize]
    [HttpGet("me")]
    public async Task<ActionResult<UserResponse>> GetCurrentUser()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
            return Unauthorized();
        
        var user = await _db.Users.FindAsync(int.Parse(userId));
        if (user == null)
            return NotFound();
        
        return Ok(MapToUserResponse(user));
    }
    
    // Update profile
    [Authorize]
    [HttpPut("profile")]
    public async Task<ActionResult<UserResponse>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
            return Unauthorized();
        
        var user = await _db.Users.FindAsync(int.Parse(userId));
        if (user == null)
            return NotFound();
        
        if (request.FullName != null) user.FullName = request.FullName;
        if (request.Headline != null) user.Headline = request.Headline;
        if (request.Summary != null) user.Summary = request.Summary;
        if (request.Phone != null) user.Phone = request.Phone;
        if (request.Location != null) user.Location = request.Location;
        if (request.CompanyName != null) user.CompanyName = request.CompanyName;
        if (request.CompanyWebsite != null) user.CompanyWebsite = request.CompanyWebsite;
        if (request.ProfilePictureUrl != null) user.ProfilePictureUrl = request.ProfilePictureUrl;
        if (request.Skills != null) user.Skills = request.Skills;
        if (request.YearsOfExperience != null) user.YearsOfExperience = request.YearsOfExperience;
        
        await _db.SaveChangesAsync();
        
        return Ok(MapToUserResponse(user));
    }
    
    private static UserResponse MapToUserResponse(User user) => new(
        user.Id,
        user.Email,
        user.FullName,
        user.ProfilePictureUrl,
        user.Headline,
        user.Summary,
        user.Phone,
        user.Location,
        user.CompanyName,
        user.CompanyWebsite,
        user.LinkedInProfileUrl,
        user.Skills,
        user.YearsOfExperience,
        user.AccountType.ToString(),
        user.Role.ToString()
    );
}
