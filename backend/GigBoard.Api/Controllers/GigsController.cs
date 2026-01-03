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
public class GigsController : ControllerBase
{
    private readonly AppDbContext _db;
    
    public GigsController(AppDbContext db)
    {
        _db = db;
    }
    
    // Public - Get all active gigs
    [HttpGet]
    public async Task<ActionResult<GigListResponse>> GetGigs(
        [FromQuery] string? search,
        [FromQuery] string? location,
        [FromQuery] string? competenceArea,
        [FromQuery] GigType? type,
        [FromQuery] bool? isRemote,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20)
    {
        var query = _db.Gigs
            .Include(g => g.PostedBy)
            .Where(g => g.IsActive && (g.ExpiresAt == null || g.ExpiresAt > DateTime.UtcNow));
        
        // Apply filters
        if (!string.IsNullOrEmpty(search))
        {
            var searchLower = search.ToLower();
            query = query.Where(g => 
                g.Title.ToLower().Contains(searchLower) ||
                g.Description.ToLower().Contains(searchLower) ||
                g.Company.ToLower().Contains(searchLower));
        }
        
        if (!string.IsNullOrEmpty(location))
            query = query.Where(g => g.Location.ToLower().Contains(location.ToLower()));
            
        if (!string.IsNullOrEmpty(competenceArea))
        {
            // Map category filters to multiple possible competence areas
            var matchingAreas = GetMatchingCompetenceAreas(competenceArea);
            query = query.Where(g => matchingAreas.Contains(g.CompetenceArea ?? ""));
        }
            
        if (type.HasValue)
            query = query.Where(g => g.Type == type.Value);
            
        if (isRemote.HasValue)
            query = query.Where(g => g.IsRemote == isRemote.Value);
        
        var totalCount = await query.CountAsync();
        
        var gigs = await query
            .OrderByDescending(g => g.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(g => MapToGigResponse(g))
            .ToListAsync();
        
        return Ok(new GigListResponse(gigs, totalCount, page, pageSize));
    }
    
    // Public - Get single gig
    [HttpGet("{id}")]
    public async Task<ActionResult<GigResponse>> GetGig(int id)
    {
        var gig = await _db.Gigs
            .Include(g => g.PostedBy)
            .Include(g => g.Applications)
            .FirstOrDefaultAsync(g => g.Id == id);
        
        if (gig == null)
            return NotFound();
        
        return Ok(MapToGigResponse(gig));
    }
    
    // Employer only - Create gig
    [Authorize(Roles = "Employer,Admin")]
    [HttpPost]
    public async Task<ActionResult<GigResponse>> CreateGig([FromBody] CreateGigRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var gig = new Gig
        {
            Title = request.Title,
            Description = request.Description,
            Company = request.Company,
            Location = request.Location,
            IsRemote = request.IsRemote,
            Type = request.Type,
            HourlyRate = request.HourlyRate,
            Duration = request.Duration,
            StartDate = request.StartDate,
            Skills = request.Skills,
            CompetenceArea = request.CompetenceArea,
            ExpiresAt = request.ExpiresAt,
            PostedById = userId
        };
        
        _db.Gigs.Add(gig);
        await _db.SaveChangesAsync();
        
        // Reload with PostedBy
        await _db.Entry(gig).Reference(g => g.PostedBy).LoadAsync();
        
        return CreatedAtAction(nameof(GetGig), new { id = gig.Id }, MapToGigResponse(gig));
    }
    
    // Employer only - Update gig
    [Authorize(Roles = "Employer,Admin")]
    [HttpPut("{id}")]
    public async Task<ActionResult<GigResponse>> UpdateGig(int id, [FromBody] UpdateGigRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var gig = await _db.Gigs
            .Include(g => g.PostedBy)
            .FirstOrDefaultAsync(g => g.Id == id);
        
        if (gig == null)
            return NotFound();
        
        if (gig.PostedById != userId && !User.IsInRole("Admin"))
            return Forbid();
        
        // Update fields
        if (request.Title != null) gig.Title = request.Title;
        if (request.Description != null) gig.Description = request.Description;
        if (request.Location != null) gig.Location = request.Location;
        if (request.IsRemote.HasValue) gig.IsRemote = request.IsRemote.Value;
        if (request.Type.HasValue) gig.Type = request.Type.Value;
        if (request.HourlyRate != null) gig.HourlyRate = request.HourlyRate;
        if (request.Duration != null) gig.Duration = request.Duration;
        if (request.StartDate.HasValue) gig.StartDate = request.StartDate.Value;
        if (request.Skills != null) gig.Skills = request.Skills;
        if (request.CompetenceArea != null) gig.CompetenceArea = request.CompetenceArea;
        if (request.IsActive.HasValue) gig.IsActive = request.IsActive.Value;
        if (request.ExpiresAt.HasValue) gig.ExpiresAt = request.ExpiresAt.Value;
        
        await _db.SaveChangesAsync();
        
        return Ok(MapToGigResponse(gig));
    }
    
    // Employer only - Delete gig
    [Authorize(Roles = "Employer,Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteGig(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var gig = await _db.Gigs.FindAsync(id);
        
        if (gig == null)
            return NotFound();
        
        if (gig.PostedById != userId && !User.IsInRole("Admin"))
            return Forbid();
        
        _db.Gigs.Remove(gig);
        await _db.SaveChangesAsync();
        
        return NoContent();
    }
    
    // Employer only - Get my gigs
    [Authorize(Roles = "Employer,Admin")]
    [HttpGet("my")]
    public async Task<ActionResult<List<GigResponse>>> GetMyGigs()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        
        var gigs = await _db.Gigs
            .Include(g => g.PostedBy)
            .Include(g => g.Applications)
            .Where(g => g.PostedById == userId)
            .OrderByDescending(g => g.CreatedAt)
            .Select(g => MapToGigResponse(g))
            .ToListAsync();
        
        return Ok(gigs);
    }
    
    private static GigResponse MapToGigResponse(Gig gig) => new(
        gig.Id,
        gig.Title,
        gig.Description,
        gig.Company,
        gig.Location,
        gig.IsRemote,
        gig.Type.ToString(),
        gig.HourlyRate,
        gig.Duration,
        gig.StartDate,
        gig.Skills,
        gig.CompetenceArea,
        gig.IsActive,
        gig.CreatedAt,
        gig.ExpiresAt,
        gig.Applications?.Count ?? 0,
        new GigPosterResponse(gig.PostedBy.Id, gig.PostedBy.FullName, gig.PostedBy.ProfilePictureUrl)
    );
    
    // Maps UI category filters to matching competence areas
    private static List<string> GetMatchingCompetenceAreas(string category) => category switch
    {
        "IT & Tech" => new List<string> 
        { 
            "IT & Tech", "Backend Development", "Frontend Development", "Full Stack", 
            "DevOps", "Mobile Development", "Data Engineering", "Architecture", 
            "Tech Lead", "Software Development", "Cloud", "Infrastructure"
        },
        "Management & Strategi" => new List<string> 
        { 
            "Management & Strategi", "Management", "Strategy", "Project Management",
            "Product Management", "Business Analysis", "Consulting"
        },
        "Ekonomi & Finans" => new List<string> 
        { 
            "Ekonomi & Finans", "Finance", "Accounting", "Financial Analysis",
            "Risk Management", "Controlling", "Treasury"
        },
        "Marknadsföring" => new List<string> 
        { 
            "Marknadsföring", "Marketing", "Design", "UX", "UI", "Digital Marketing",
            "Content", "Brand", "Communications", "SEO", "Social Media"
        },
        "HR & Rekrytering" => new List<string> 
        { 
            "HR & Rekrytering", "HR", "Recruitment", "Talent Acquisition",
            "People Operations", "Learning & Development"
        },
        "Juridik" => new List<string> 
        { 
            "Juridik", "Legal", "Compliance", "Contract Management"
        },
        "Bygg & Teknik" => new List<string> 
        { 
            "Bygg & Teknik", "Construction", "Engineering", "Civil Engineering",
            "Mechanical Engineering", "Electrical Engineering"
        },
        "Vård & Omsorg" => new List<string> 
        { 
            "Vård & Omsorg", "Healthcare", "Medical", "Healthtech", "Life Science"
        },
        _ => new List<string> { category }
    };
}

