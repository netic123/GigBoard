using Microsoft.AspNetCore.Mvc;

namespace GigBoard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UploadController : ControllerBase
{
    private readonly IWebHostEnvironment _env;
    private readonly string[] _allowedExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
    private const long MaxFileSize = 5 * 1024 * 1024; // 5MB

    public UploadController(IWebHostEnvironment env)
    {
        _env = env;
    }

    [HttpPost("image")]
    public async Task<ActionResult<UploadResponse>> UploadImage(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { error = "Ingen fil vald" });

        if (file.Length > MaxFileSize)
            return BadRequest(new { error = "Filen är för stor. Max 5MB." });

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_allowedExtensions.Contains(extension))
            return BadRequest(new { error = "Ogiltigt filformat. Tillåtna format: JPG, PNG, GIF, WEBP" });

        // Create uploads directory if it doesn't exist
        var uploadsFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "profiles");
        Directory.CreateDirectory(uploadsFolder);

        // Generate unique filename
        var fileName = $"{Guid.NewGuid()}{extension}";
        var filePath = Path.Combine(uploadsFolder, fileName);

        // Save file
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // Return URL
        var url = $"/uploads/profiles/{fileName}";
        return Ok(new UploadResponse(url));
    }
}

public record UploadResponse(string Url);
