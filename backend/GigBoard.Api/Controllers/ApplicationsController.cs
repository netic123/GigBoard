using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GigBoard.Api.Data;
using GigBoard.Api.DTOs;
using GigBoard.Api.Models;
using GigBoard.Api.Services;
using System.Security.Claims;

namespace GigBoard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ApplicationsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IEmailService _emailService;
    
    public ApplicationsController(AppDbContext db, IEmailService emailService)
    {
        _db = db;
        _emailService = emailService;
    }
    
    // Candidate - Apply to gig
    [Authorize]
    [HttpPost("gig/{gigId}")]
    public async Task<ActionResult<ApplicationResponse>> Apply(int gigId, [FromBody] ApplyRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var gig = await _db.Gigs
            .Include(g => g.PostedBy)
            .FirstOrDefaultAsync(g => g.Id == gigId);
        
        if (gig == null)
            return NotFound(new { error = "Gig not found" });
        
        if (!gig.IsActive)
            return BadRequest(new { error = "This gig is no longer active" });
        
        // Check if already applied
        var existing = await _db.Applications
            .FirstOrDefaultAsync(a => a.GigId == gigId && a.ApplicantId == userId);
        
        if (existing != null)
            return BadRequest(new { error = "You have already applied to this gig" });
        
        var applicant = await _db.Users.FindAsync(userId);
        if (applicant == null)
            return Unauthorized();
        
        var application = new Application
        {
            GigId = gigId,
            ApplicantId = userId,
            Message = request.Message
        };
        
        _db.Applications.Add(application);
        await _db.SaveChangesAsync();
        
        // Send email notification to employer
        await _emailService.SendApplicationNotification(gig, applicant, request.Message);
        
        // Reload with navigation properties
        await _db.Entry(application).Reference(a => a.Gig).LoadAsync();
        await _db.Entry(application).Reference(a => a.Applicant).LoadAsync();
        
        return Ok(MapToApplicationResponse(application));
    }
    
    // Candidate - Get my applications
    [Authorize]
    [HttpGet("my")]
    public async Task<ActionResult<List<ApplicationResponse>>> GetMyApplications()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var applications = await _db.Applications
            .Include(a => a.Gig)
            .Include(a => a.Applicant)
            .Where(a => a.ApplicantId == userId)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync();
        
        return Ok(applications.Select(MapToApplicationResponse));
    }
    
    // Employer - Get applications for a gig
    [Authorize(Roles = "Employer,Admin")]
    [HttpGet("gig/{gigId}")]
    public async Task<ActionResult<List<ApplicationResponse>>> GetGigApplications(int gigId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var gig = await _db.Gigs.FindAsync(gigId);
        if (gig == null)
            return NotFound();
        
        if (gig.PostedById != userId && !User.IsInRole("Admin"))
            return Forbid();
        
        var applications = await _db.Applications
            .Include(a => a.Gig)
            .Include(a => a.Applicant)
            .Where(a => a.GigId == gigId)
            .OrderByDescending(a => a.AppliedAt)
            .ToListAsync();
        
        return Ok(applications.Select(MapToApplicationResponse));
    }
    
    // Employer - Update application status
    [Authorize(Roles = "Employer,Admin")]
    [HttpPatch("{id}/status")]
    public async Task<ActionResult<ApplicationResponse>> UpdateStatus(int id, [FromBody] ApplicationStatus status)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var application = await _db.Applications
            .Include(a => a.Gig)
            .Include(a => a.Applicant)
            .FirstOrDefaultAsync(a => a.Id == id);
        
        if (application == null)
            return NotFound();
        
        if (application.Gig.PostedById != userId && !User.IsInRole("Admin"))
            return Forbid();
        
        application.Status = status;
        await _db.SaveChangesAsync();
        
        return Ok(MapToApplicationResponse(application));
    }
    
    private static ApplicationResponse MapToApplicationResponse(Application a) => new(
        a.Id,
        a.Message,
        a.Status.ToString(),
        a.AppliedAt,
        new ApplicantResponse(
            a.Applicant.Id,
            a.Applicant.FullName,
            a.Applicant.Email,
            a.Applicant.ProfilePictureUrl,
            a.Applicant.Headline,
            a.Applicant.LinkedInProfileUrl,
            a.Applicant.CompanyName,
            a.Applicant.Phone,
            a.Applicant.Location,
            a.Applicant.Skills,
            a.Applicant.YearsOfExperience,
            a.Applicant.AccountType.ToString(),
            a.Applicant.IsActivelyLooking,
            a.Applicant.Availability
        ),
        new GigSummaryResponse(
            a.Gig.Id,
            a.Gig.Title,
            a.Gig.Company,
            a.Gig.Location
        )
    );
}

