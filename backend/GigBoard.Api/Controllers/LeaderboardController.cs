using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using GigBoard.Api.Data;
using GigBoard.Api.DTOs;
using GigBoard.Api.Models;

namespace GigBoard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LeaderboardController : ControllerBase
{
    private readonly AppDbContext _context;

    public LeaderboardController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get the leaderboard of top candidates based on completed gigs and ratings
    /// Sorted by: 1) Number of completed gigs (descending), 2) Average rating (descending)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<LeaderboardResponseDto>> GetLeaderboard([FromQuery] int limit = 50)
    {
        // Use subqueries to properly count reviews and compute averages
        var candidatesQuery = _context.Users
            .Where(u => u.Role == UserRole.Candidate)
            .Select(u => new
            {
                User = u,
                CompletedGigsCount = u.Applications.Count(a => a.Status == ApplicationStatus.Accepted),
                TotalReviews = _context.Reviews.Count(r => r.CandidateId == u.Id),
                AverageRating = _context.Reviews.Where(r => r.CandidateId == u.Id).Any() 
                    ? _context.Reviews.Where(r => r.CandidateId == u.Id).Average(r => (double)r.Rating) 
                    : 0
            })
            .Where(x => x.CompletedGigsCount > 0 || x.TotalReviews > 0);

        var candidates = await candidatesQuery.ToListAsync();

        // Now join with user data for the final DTO
        var userIds = candidates.Select(c => c.User.Id).ToList();
        var users = await _context.Users
            .Where(u => userIds.Contains(u.Id))
            .ToListAsync();

        var leaderboardEntries = candidates
            .Select(x => {
                var user = users.First(u => u.Id == x.User.Id);
                return new LeaderboardEntryDto(
                    UserId: user.Id,
                    FullName: user.FullName,
                    ProfilePictureUrl: user.ProfilePictureUrl,
                    Headline: user.Headline,
                    CompanyName: user.CompanyName,
                    CandidateType: user.CandidateType?.ToString() ?? "Unknown",
                    CompletedGigsCount: x.CompletedGigsCount,
                    AverageRating: Math.Round(x.AverageRating, 1),
                    TotalReviews: x.TotalReviews,
                    TopSkills: user.Skills.Take(5).ToList(),
                    IsActivelyLooking: user.IsActivelyLooking,
                    Availability: user.Availability
                );
            })
            // Sort by: 1) Most completed gigs, 2) Highest rating as tiebreaker
            .OrderByDescending(e => e.CompletedGigsCount)
            .ThenByDescending(e => e.AverageRating)
            .ThenByDescending(e => e.TotalReviews) // More reviews = more reliable rating
            .ToList();

        var topCandidates = leaderboardEntries.Take(limit).ToList();

        return Ok(new LeaderboardResponseDto(
            TopCandidates: topCandidates,
            TotalCandidates: leaderboardEntries.Count
        ));
    }

    /// <summary>
    /// Get a specific candidate's stats
    /// </summary>
    [HttpGet("{userId}")]
    public async Task<ActionResult<LeaderboardEntryDto>> GetCandidateStats(int userId)
    {
        var candidate = await _context.Users
            .Where(u => u.Id == userId && u.Role == UserRole.Candidate)
            .Select(u => new
            {
                User = u,
                CompletedGigsCount = u.Applications.Count(a => a.Status == ApplicationStatus.Accepted),
                TotalReviews = _context.Reviews.Count(r => r.CandidateId == u.Id),
                AverageRating = _context.Reviews.Where(r => r.CandidateId == u.Id).Any() 
                    ? _context.Reviews.Where(r => r.CandidateId == u.Id).Average(r => (double)r.Rating) 
                    : 0
            })
            .FirstOrDefaultAsync();

        if (candidate == null)
            return NotFound("Candidate not found");

        var entry = new LeaderboardEntryDto(
            UserId: candidate.User.Id,
            FullName: candidate.User.FullName,
            ProfilePictureUrl: candidate.User.ProfilePictureUrl,
            Headline: candidate.User.Headline,
            CompanyName: candidate.User.CompanyName,
            CandidateType: candidate.User.CandidateType?.ToString() ?? "Unknown",
            CompletedGigsCount: candidate.CompletedGigsCount,
            AverageRating: Math.Round(candidate.AverageRating, 1),
            TotalReviews: candidate.TotalReviews,
            TopSkills: candidate.User.Skills.Take(5).ToList(),
            IsActivelyLooking: candidate.User.IsActivelyLooking,
            Availability: candidate.User.Availability
        );

        return Ok(entry);
    }
}

