using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json.Serialization;
using GigBoard.Api.Data;
using GigBoard.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Load optional local settings (for connecting to Azure DB locally)
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

// Database - SQL Server
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");

builder.Services.AddDbContext<AppDbContext>(options =>
{
    options.UseSqlServer(connectionString);
});

// Services
builder.Services.AddHttpClient();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ILinkedInService, LinkedInService>();

// Authentication
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        var origins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>() 
            ?? new[] { "http://localhost:5173" };
        
        // Filter out wildcard patterns
        var wildcardOrigins = origins.Where(o => o.Contains("*")).ToList();
        var exactOrigins = origins.Where(o => !o.Contains("*")).ToArray();
        
        // Use SetIsOriginAllowed for flexible origin matching (supports both exact and wildcard)
        policy.SetIsOriginAllowed(origin =>
        {
            // Check exact origins first
            if (exactOrigins.Contains(origin, StringComparer.OrdinalIgnoreCase))
            {
                return true;
            }
            
            // Check wildcard patterns
            foreach (var pattern in wildcardOrigins)
            {
                var regexPattern = "^" + System.Text.RegularExpressions.Regex.Escape(pattern)
                    .Replace("\\*", ".*") + "$";
                if (System.Text.RegularExpressions.Regex.IsMatch(origin, regexPattern, 
                    System.Text.RegularExpressions.RegexOptions.IgnoreCase))
                {
                    return true;
                }
            }
            
            return false;
        });
        
        policy.AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Ensure database is created/migrated
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    if (app.Environment.IsDevelopment())
    {
        db.Database.EnsureCreated();
        // Seed test data only in Development
        await SeedData.InitializeAsync(db);
    }
    else
    {
        db.Database.Migrate();
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Fallback to index.html for SPA
app.MapFallbackToFile("index.html");

app.Run();
