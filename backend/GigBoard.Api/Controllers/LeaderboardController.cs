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
        var candidatesQuery = _context.Users
            .Where(u => u.Role == UserRole.Candidate)
            .Select(u => new
            {
                User = u,
                CompletedGigsCount = u.Applications.Count(a => a.Status == ApplicationStatus.Accepted),
                Reviews = u.ReceivedReviews.ToList()
            })
            .Where(x => x.CompletedGigsCount > 0 || x.Reviews.Any());

        var candidates = await candidatesQuery.ToListAsync();

        var leaderboardEntries = candidates
            .Select(x => new LeaderboardEntryDto(
                UserId: x.User.Id,
                FullName: x.User.FullName,
                ProfilePictureUrl: x.User.ProfilePictureUrl,
                Headline: x.User.Headline,
                CompanyName: x.User.CompanyName,
                CandidateType: x.User.CandidateType?.ToString() ?? "Unknown",
                CompletedGigsCount: x.CompletedGigsCount,
                AverageRating: x.Reviews.Any() ? Math.Round(x.Reviews.Average(r => r.Rating), 1) : 0,
                TotalReviews: x.Reviews.Count,
                TopSkills: x.User.Skills.Take(5).ToList(),
                IsActivelyLooking: x.User.IsActivelyLooking,
                Availability: x.User.Availability
            ))
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
                Reviews = u.ReceivedReviews.ToList()
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
            AverageRating: candidate.Reviews.Any() ? Math.Round(candidate.Reviews.Average(r => r.Rating), 1) : 0,
            TotalReviews: candidate.Reviews.Count,
            TopSkills: candidate.User.Skills.Take(5).ToList(),
            IsActivelyLooking: candidate.User.IsActivelyLooking,
            Availability: candidate.User.Availability
        );

        return Ok(entry);
    }
}

