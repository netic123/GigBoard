using Microsoft.EntityFrameworkCore;
using GigBoard.Api.Models;

namespace GigBoard.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    
    public DbSet<User> Users => Set<User>();
    public DbSet<Gig> Gigs => Set<Gig>();
    public DbSet<Application> Applications => Set<Application>();
    
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        // User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Email).IsUnique();
            entity.HasIndex(u => u.LinkedInId);
            
            // Store Skills as JSON
            entity.Property(u => u.Skills)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<string>()
                );
        });
        
        // Gig
        modelBuilder.Entity<Gig>(entity =>
        {
            entity.HasOne(g => g.PostedBy)
                .WithMany(u => u.PostedGigs)
                .HasForeignKey(g => g.PostedById)
                .OnDelete(DeleteBehavior.Cascade);
                
            // Store Skills as JSON
            entity.Property(g => g.Skills)
                .HasConversion(
                    v => System.Text.Json.JsonSerializer.Serialize(v, (System.Text.Json.JsonSerializerOptions?)null),
                    v => System.Text.Json.JsonSerializer.Deserialize<List<string>>(v, (System.Text.Json.JsonSerializerOptions?)null) ?? new List<string>()
                );
        });
        
        // Application
        modelBuilder.Entity<Application>(entity =>
        {
            entity.HasOne(a => a.Gig)
                .WithMany(g => g.Applications)
                .HasForeignKey(a => a.GigId)
                .OnDelete(DeleteBehavior.Cascade);
                
            entity.HasOne(a => a.Applicant)
                .WithMany(u => u.Applications)
                .HasForeignKey(a => a.ApplicantId)
                .OnDelete(DeleteBehavior.Restrict);
                
            // Prevent duplicate applications
            entity.HasIndex(a => new { a.GigId, a.ApplicantId }).IsUnique();
        });
    }
}
