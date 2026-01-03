using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GigBoard.Api.Data;
using GigBoard.Api.DTOs;
using GigBoard.Api.Models;
using System.Security.Claims;

namespace GigBoard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReviewsController(AppDbContext context)
    {
        _context = context;
    }

    private int? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return int.TryParse(userIdClaim, out var userId) ? userId : null;
    }

    /// <summary>
    /// Get all reviews for a candidate - publicly viewable
    /// </summary>
    [HttpGet("candidate/{candidateId}")]
    public async Task<ActionResult<CandidateReviewsSummary>> GetCandidateReviews(int candidateId)
    {
        var candidate = await _context.Users
            .FirstOrDefaultAsync(u => u.Id == candidateId && u.Role == UserRole.Candidate);

        if (candidate == null)
            return NotFound(new { error = "Candidate not found" });

        var reviews = await _context.Reviews
            .Include(r => r.Reviewer)
            .Include(r => r.Gig)
            .Where(r => r.CandidateId == candidateId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        var completedGigsCount = await _context.Applications
            .Where(a => a.ApplicantId == candidateId && a.Status == ApplicationStatus.Accepted)
            .CountAsync();

        var reviewResponses = reviews.Select(r => new ReviewResponse(
            r.Id,
            r.Rating,
            r.Comment,
            r.CreatedAt,
            new ReviewerInfo(
                r.Reviewer.Id,
                r.Reviewer.FullName,
                r.Reviewer.CompanyName,
                r.Reviewer.ProfilePictureUrl
            ),
            r.Gig != null ? new GigInfo(r.Gig.Id, r.Gig.Title, r.Gig.Company) : null
        )).ToList();

        var averageRating = reviews.Count > 0 ? reviews.Average(r => r.Rating) : 0;

        return new CandidateReviewsSummary(
            candidate.Id,
            candidate.FullName,
            candidate.ProfilePictureUrl,
            candidate.Headline,
            candidate.CompanyName,
            candidate.CandidateType?.ToString(),
            Math.Round(averageRating, 1),
            reviews.Count,
            completedGigsCount,
            reviewResponses,
            // Extended profile info
            candidate.Summary,
            candidate.Location,
            candidate.Skills,
            candidate.YearsOfExperience,
            candidate.LinkedInProfileUrl,
            // What they're looking for
            candidate.IsActivelyLooking,
            candidate.LookingFor,
            candidate.PreferredGigTypes,
            candidate.Availability
        );
    }

    /// <summary>
    /// Check if current employer can review a candidate for a specific gig
    /// </summary>
    [HttpGet("can-review/{candidateId}/{gigId}")]
    [Authorize]
    public async Task<ActionResult<CanReviewResponse>> CanReview(int candidateId, int gigId)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var user = await _context.Users.FindAsync(userId.Value);
        if (user == null || user.Role != UserRole.Employer)
            return new CanReviewResponse(false, false, "Only employers can review candidates");

        // Check if this employer owns the gig
        var gig = await _context.Gigs.FirstOrDefaultAsync(g => g.Id == gigId && g.PostedById == userId.Value);
        if (gig == null)
            return new CanReviewResponse(false, false, "You can only review candidates for your own gigs");

        // Check if the candidate has an accepted application for this gig
        var hasAcceptedApplication = await _context.Applications
            .AnyAsync(a => a.GigId == gigId && a.ApplicantId == candidateId && a.Status == ApplicationStatus.Accepted);

        if (!hasAcceptedApplication)
            return new CanReviewResponse(false, false, "The candidate must have an accepted application for this gig");

        // Check if already reviewed
        var hasAlreadyReviewed = await _context.Reviews
            .AnyAsync(r => r.ReviewerId == userId.Value && r.CandidateId == candidateId && r.GigId == gigId);

        if (hasAlreadyReviewed)
            return new CanReviewResponse(false, true, "You have already reviewed this candidate for this gig");

        return new CanReviewResponse(true, false, null);
    }

    /// <summary>
    /// Create a review - only the employer who accepted the candidate can review
    /// </summary>
    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ReviewResponse>> CreateReview([FromBody] CreateReviewRequest request)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var user = await _context.Users.FindAsync(userId.Value);
        if (user == null || user.Role != UserRole.Employer)
            return Forbid("Only employers can review candidates");

        // Validate rating
        if (request.Rating < 1 || request.Rating > 5)
            return BadRequest(new { error = "Rating must be between 1 and 5" });

        // Check if this employer owns the gig
        var gig = await _context.Gigs.FirstOrDefaultAsync(g => g.Id == request.GigId && g.PostedById == userId.Value);
        if (gig == null)
            return BadRequest(new { error = "You can only review candidates for your own gigs" });

        // Check if the candidate exists and is a candidate
        var candidate = await _context.Users.FirstOrDefaultAsync(u => u.Id == request.CandidateId && u.Role == UserRole.Candidate);
        if (candidate == null)
            return BadRequest(new { error = "Candidate not found" });

        // Check if the candidate has an accepted application for this gig
        var hasAcceptedApplication = await _context.Applications
            .AnyAsync(a => a.GigId == request.GigId && a.ApplicantId == request.CandidateId && a.Status == ApplicationStatus.Accepted);

        if (!hasAcceptedApplication)
            return BadRequest(new { error = "You can only review candidates who have accepted applications for your gigs" });

        // Check if already reviewed
        var existingReview = await _context.Reviews
            .AnyAsync(r => r.ReviewerId == userId.Value && r.CandidateId == request.CandidateId && r.GigId == request.GigId);

        if (existingReview)
            return BadRequest(new { error = "You have already reviewed this candidate for this gig" });

        // Create the review
        var review = new Review
        {
            Rating = request.Rating,
            Comment = request.Comment,
            ReviewerId = userId.Value,
            CandidateId = request.CandidateId,
            GigId = request.GigId,
            CreatedAt = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        // Reload with includes
        await _context.Entry(review).Reference(r => r.Reviewer).LoadAsync();
        await _context.Entry(review).Reference(r => r.Gig).LoadAsync();

        return CreatedAtAction(nameof(GetCandidateReviews), new { candidateId = request.CandidateId }, new ReviewResponse(
            review.Id,
            review.Rating,
            review.Comment,
            review.CreatedAt,
            new ReviewerInfo(
                user.Id,
                user.FullName,
                user.CompanyName,
                user.ProfilePictureUrl
            ),
            gig != null ? new GigInfo(gig.Id, gig.Title, gig.Company) : null
        ));
    }

    /// <summary>
    /// Get reviews given by the current employer
    /// </summary>
    [HttpGet("my-reviews")]
    [Authorize]
    public async Task<ActionResult<List<ReviewResponse>>> GetMyReviews()
    {
        var userId = GetCurrentUserId();
        if (userId == null)
            return Unauthorized();

        var reviews = await _context.Reviews
            .Include(r => r.Reviewer)
            .Include(r => r.Gig)
            .Include(r => r.Candidate)
            .Where(r => r.ReviewerId == userId.Value)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync();

        return reviews.Select(r => new ReviewResponse(
            r.Id,
            r.Rating,
            r.Comment,
            r.CreatedAt,
            new ReviewerInfo(
                r.Reviewer.Id,
                r.Reviewer.FullName,
                r.Reviewer.CompanyName,
                r.Reviewer.ProfilePictureUrl
            ),
            r.Gig != null ? new GigInfo(r.Gig.Id, r.Gig.Title, r.Gig.Company) : null
        )).ToList();
    }
}

