using GigBoard.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GigBoard.Api.Data;

public static class SeedData
{
    public static async Task InitializeAsync(AppDbContext context)
    {
        // Only seed if database is empty
        if (await context.Users.AnyAsync())
            return;

        // Create employers (companies that post gigs)
        var employers = new List<User>
        {
            new User
            {
                Email = "hr@techcorp.se",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                FullName = "Anna Johansson",
                AccountType = AccountType.Company,
                Role = UserRole.Employer,
                CompanyName = "TechCorp AB",
                CompanyWebsite = "https://techcorp.se",
                OrganizationNumber = "556123-4567",
                ProfilePictureUrl = "https://ui-avatars.com/api/?name=TechCorp&background=0D8ABC&color=fff",
                Headline = "HR Manager",
                Location = "Stockholm",
                Phone = "08-123 45 67"
            },
            new User
            {
                Email = "rekrytering@finansbolaget.se",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                FullName = "Erik Lindgren",
                AccountType = AccountType.Company,
                Role = UserRole.Employer,
                CompanyName = "Finansbolaget AB",
                CompanyWebsite = "https://finansbolaget.se",
                OrganizationNumber = "556234-5678",
                ProfilePictureUrl = "https://ui-avatars.com/api/?name=Finans&background=2E7D32&color=fff",
                Headline = "Talent Acquisition Lead",
                Location = "Göteborg",
                Phone = "031-234 56 78"
            },
            new User
            {
                Email = "hr@medtech.se",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                FullName = "Maria Svensson",
                AccountType = AccountType.Company,
                Role = UserRole.Employer,
                CompanyName = "MedTech Solutions",
                CompanyWebsite = "https://medtech.se",
                OrganizationNumber = "556345-6789",
                ProfilePictureUrl = "https://ui-avatars.com/api/?name=MedTech&background=7B1FA2&color=fff",
                Headline = "Head of HR",
                Location = "Malmö",
                Phone = "040-345 67 89"
            },
            new User
            {
                Email = "talent@retailgroup.se",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                FullName = "Johan Bergström",
                AccountType = AccountType.Company,
                Role = UserRole.Employer,
                CompanyName = "Retail Group Nordic",
                CompanyWebsite = "https://retailgroup.se",
                OrganizationNumber = "556456-7890",
                ProfilePictureUrl = "https://ui-avatars.com/api/?name=Retail&background=E65100&color=fff",
                Headline = "Recruitment Manager",
                Location = "Uppsala"
            }
        };

        // Create candidates (mix of freelance and consulting firm)
        var candidates = new List<User>
        {
            new User
            {
                Email = "johan.dev@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                FullName = "Johan Andersson",
                AccountType = AccountType.Personal,
                Role = UserRole.Candidate,
                CandidateType = CandidateType.Freelance,
                ProfilePictureUrl = "https://ui-avatars.com/api/?name=Johan+A&background=1976D2&color=fff",
                Headline = "Senior .NET Developer",
                Summary = "15 års erfarenhet av .NET-utveckling. Specialiserad på microservices och Azure.",
                Location = "Stockholm",
                Skills = new List<string> { "C#", ".NET", "Azure", "SQL Server", "Microservices", "Docker" },
                YearsOfExperience = 15,
                Phone = "070-123 45 67",
                // What I'm looking for
                IsActivelyLooking = true,
                LookingFor = "Söker backend-uppdrag inom fintech eller e-handel. Gillar utmaningar med hög teknisk komplexitet och moderna arkitekturer.",
                PreferredGigTypes = new List<string> { "Contract", "Freelance" },
                Availability = "Tillgänglig omgående"
            },
            new User
            {
                Email = "sara.cgi@cgi.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                FullName = "Sara Nilsson",
                AccountType = AccountType.Personal,
                Role = UserRole.Candidate,
                CandidateType = CandidateType.ConsultingFirm,
                CompanyName = "CGI",
                ProfilePictureUrl = "https://ui-avatars.com/api/?name=Sara+N&background=D32F2F&color=fff",
                Headline = "Tech Lead / Full Stack Developer",
                Summary = "Tech Lead på CGI med fokus på moderna webbapplikationer och molnlösningar.",
                Location = "Göteborg",
                Skills = new List<string> { "React", "TypeScript", "Node.js", "AWS", "PostgreSQL", "Kubernetes" },
                YearsOfExperience = 10,
                Phone = "073-234 56 78",
                // What I'm looking for
                IsActivelyLooking = true,
                LookingFor = "Söker Tech Lead-roller eller senior fullstack-positioner. Intresserad av greenfield-projekt och team-building.",
                PreferredGigTypes = new List<string> { "Contract", "FullTime" },
                Availability = "Tillgänglig från mars 2026"
            },
            new User
            {
                Email = "marcus.capgemini@capgemini.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                FullName = "Marcus Ek",
                AccountType = AccountType.Personal,
                Role = UserRole.Candidate,
                CandidateType = CandidateType.ConsultingFirm,
                CompanyName = "Capgemini",
                ProfilePictureUrl = "https://ui-avatars.com/api/?name=Marcus+E&background=388E3C&color=fff",
                Headline = "DevOps Engineer",
                Summary = "DevOps-specialist på Capgemini. Certifierad i Azure och AWS.",
                Location = "Stockholm",
                Skills = new List<string> { "Azure DevOps", "Terraform", "Kubernetes", "CI/CD", "Python", "Bash" },
                YearsOfExperience = 8,
                Phone = "076-345 67 89"
            },
            new User
            {
                Email = "emma.freelance@outlook.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                FullName = "Emma Larsson",
                AccountType = AccountType.Personal,
                Role = UserRole.Candidate,
                CandidateType = CandidateType.Freelance,
                ProfilePictureUrl = "https://ui-avatars.com/api/?name=Emma+L&background=7B1FA2&color=fff",
                Headline = "UX/UI Designer & Frontend Developer",
                Summary = "Kombinerar design och kod. Skapar användarvänliga gränssnitt med fokus på tillgänglighet.",
                Location = "Malmö",
                Skills = new List<string> { "Figma", "React", "CSS", "Accessibility", "User Research", "Design Systems" },
                YearsOfExperience = 7,
                Phone = "070-456 78 90",
                // What I'm looking for
                IsActivelyLooking = true,
                LookingFor = "Söker UX/UI-uppdrag där jag kan kombinera design och frontend-utveckling. Brinner för tillgänglighet och användarvänliga lösningar.",
                PreferredGigTypes = new List<string> { "Freelance", "PartTime" },
                Availability = "Kan ta nya uppdrag parallellt"
            },
            new User
            {
                Email = "anders.knowit@knowit.se",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                FullName = "Anders Bergqvist",
                AccountType = AccountType.Personal,
                Role = UserRole.Candidate,
                CandidateType = CandidateType.ConsultingFirm,
                CompanyName = "Knowit",
                ProfilePictureUrl = "https://ui-avatars.com/api/?name=Anders+B&background=F57C00&color=fff",
                Headline = "Solution Architect",
                Summary = "Arkitekt med bred erfarenhet från enterprise-system till startup-miljöer.",
                Location = "Stockholm",
                Skills = new List<string> { "Solution Architecture", "Java", "Spring Boot", "Kafka", "Azure", "Event-Driven" },
                YearsOfExperience = 12,
                Phone = "073-567 89 01"
            },
            new User
            {
                Email = "lisa.data@gmail.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Test123!"),
                FullName = "Lisa Öberg",
                AccountType = AccountType.Personal,
                Role = UserRole.Candidate,
                CandidateType = CandidateType.Freelance,
                ProfilePictureUrl = "https://ui-avatars.com/api/?name=Lisa+O&background=00838F&color=fff",
                Headline = "Data Engineer / ML Specialist",
                Summary = "Specialiserad på datapipelines och maskininlärning. Python och Spark-expert.",
                Location = "Uppsala",
                Skills = new List<string> { "Python", "Spark", "Databricks", "Machine Learning", "SQL", "Airflow" },
                YearsOfExperience = 6,
                Phone = "076-678 90 12",
                // What I'm looking for
                IsActivelyLooking = false, // Not actively looking
                LookingFor = "Öppen för spännande ML-projekt inom healthtech eller fintech.",
                PreferredGigTypes = new List<string> { "Contract" },
                Availability = "I uppdrag till juni 2026"
            }
        };

        await context.Users.AddRangeAsync(employers);
        await context.Users.AddRangeAsync(candidates);
        await context.SaveChangesAsync();

        // Create gigs
        var gigs = new List<Gig>
        {
            // IT & Tech gigs
            new Gig
            {
                Title = "Senior .NET Backend Developer",
                Description = "Vi söker en erfaren .NET-utvecklare för att vidareutveckla vår e-handelsplattform. Du kommer arbeta med microservices, Azure och moderna utvecklingsmetoder.",
                Company = "TechCorp AB",
                Location = "Stockholm",
                IsRemote = true,
                Type = GigType.Contract,
                HourlyRate = "850-1000 SEK",
                Duration = "6 månader",
                StartDate = DateTime.UtcNow.AddDays(14),
                Skills = new List<string> { "C#", ".NET 8", "Azure", "Microservices", "SQL Server" },
                CompetenceArea = "IT & Tech",
                PostedById = employers[0].Id,
                ExpiresAt = DateTime.UtcNow.AddDays(30)
            },
            new Gig
            {
                Title = "React Frontend Developer",
                Description = "Söker frontend-utvecklare för att bygga nästa generations bankapplikation. Modern tech stack med React, TypeScript och GraphQL.",
                Company = "Finansbolaget AB",
                Location = "Göteborg",
                IsRemote = false,
                Type = GigType.Contract,
                HourlyRate = "800-950 SEK",
                Duration = "12 månader",
                StartDate = DateTime.UtcNow.AddDays(30),
                Skills = new List<string> { "React", "TypeScript", "GraphQL", "Jest", "Storybook" },
                CompetenceArea = "IT & Tech",
                PostedById = employers[1].Id,
                ExpiresAt = DateTime.UtcNow.AddDays(45)
            },
            new Gig
            {
                Title = "DevOps Engineer - Cloud Migration",
                Description = "Vi behöver hjälp med att migrera vår infrastruktur till Azure. Erfarenhet av Kubernetes och Terraform är ett krav.",
                Company = "MedTech Solutions",
                Location = "Malmö",
                IsRemote = true,
                Type = GigType.Contract,
                HourlyRate = "900-1100 SEK",
                Duration = "3 månader",
                StartDate = DateTime.UtcNow.AddDays(7),
                Skills = new List<string> { "Azure", "Kubernetes", "Terraform", "CI/CD", "Docker" },
                CompetenceArea = "IT & Tech",
                PostedById = employers[2].Id,
                ExpiresAt = DateTime.UtcNow.AddDays(21)
            },
            new Gig
            {
                Title = "UX Designer",
                Description = "Vi söker en UX-designer för att förbättra användarupplevelsen i vår e-handelsapp. Du kommer jobba nära produktteamet.",
                Company = "Retail Group Nordic",
                Location = "Uppsala",
                IsRemote = true,
                Type = GigType.PartTime,
                HourlyRate = "700-850 SEK",
                Duration = "Löpande",
                StartDate = DateTime.UtcNow.AddDays(21),
                Skills = new List<string> { "Figma", "User Research", "Prototyping", "Design Systems" },
                CompetenceArea = "Marknadsföring",
                PostedById = employers[3].Id,
                ExpiresAt = DateTime.UtcNow.AddDays(60)
            },
            // Ekonomi & Finans gig
            new Gig
            {
                Title = "Data Engineer",
                Description = "Bygg och underhåll våra datapipelines för finansiell analys. Vi använder Databricks, Spark och Python.",
                Company = "Finansbolaget AB",
                Location = "Göteborg",
                IsRemote = true,
                Type = GigType.Contract,
                HourlyRate = "850-1000 SEK",
                Duration = "9 månader",
                StartDate = DateTime.UtcNow.AddDays(30),
                Skills = new List<string> { "Python", "Spark", "Databricks", "SQL", "Airflow" },
                CompetenceArea = "Ekonomi & Finans",
                PostedById = employers[1].Id,
                ExpiresAt = DateTime.UtcNow.AddDays(30)
            },
            // Management gig
            new Gig
            {
                Title = "Solution Architect",
                Description = "Vi behöver en arkitekt för att designa vår nya plattform. Event-driven arkitektur och erfarenhet av storskaliga system.",
                Company = "TechCorp AB",
                Location = "Stockholm",
                IsRemote = false,
                Type = GigType.Contract,
                HourlyRate = "1000-1200 SEK",
                Duration = "6 månader",
                StartDate = DateTime.UtcNow.AddDays(14),
                Skills = new List<string> { "Solution Architecture", "Event-Driven", "Azure", "Microservices" },
                CompetenceArea = "Management & Strategi",
                PostedById = employers[0].Id,
                ExpiresAt = DateTime.UtcNow.AddDays(30)
            },
            // Vård & Omsorg gig
            new Gig
            {
                Title = "Full Stack Developer - Healthtech",
                Description = "Utveckla vår nya patientportal. React frontend och .NET backend. Erfarenhet av HIPAA/GDPR är meriterande.",
                Company = "MedTech Solutions",
                Location = "Malmö",
                IsRemote = true,
                Type = GigType.FullTime,
                HourlyRate = "800-950 SEK",
                Duration = "12 månader+",
                StartDate = DateTime.UtcNow.AddDays(30),
                Skills = new List<string> { "React", ".NET", "PostgreSQL", "Docker", "GDPR" },
                CompetenceArea = "Vård & Omsorg",
                PostedById = employers[2].Id,
                ExpiresAt = DateTime.UtcNow.AddDays(45)
            },
            new Gig
            {
                Title = "Mobile Developer - React Native",
                Description = "Vi bygger om vår mobilapp i React Native. Söker erfaren utvecklare som kan driva projektet.",
                Company = "Retail Group Nordic",
                Location = "Stockholm",
                IsRemote = true,
                Type = GigType.Contract,
                HourlyRate = "850-1000 SEK",
                Duration = "4 månader",
                StartDate = DateTime.UtcNow.AddDays(7),
                Skills = new List<string> { "React Native", "TypeScript", "iOS", "Android", "REST API" },
                CompetenceArea = "IT & Tech",
                PostedById = employers[3].Id,
                ExpiresAt = DateTime.UtcNow.AddDays(21)
            },
            new Gig
            {
                Title = "Backend Developer - Python",
                Description = "Vidareutveckla vårt ML-system och API:er. Python, FastAPI och erfarenhet av ML-pipelines.",
                Company = "Finansbolaget AB",
                Location = "Göteborg",
                IsRemote = true,
                Type = GigType.Contract,
                HourlyRate = "850-1000 SEK",
                Duration = "6 månader",
                StartDate = DateTime.UtcNow.AddDays(14),
                Skills = new List<string> { "Python", "FastAPI", "Machine Learning", "PostgreSQL", "Docker" },
                CompetenceArea = "IT & Tech",
                PostedById = employers[1].Id,
                ExpiresAt = DateTime.UtcNow.AddDays(30)
            },
            new Gig
            {
                Title = "Tech Lead - Microservices",
                Description = "Leda ett team av 5 utvecklare. Ansvar för arkitektur och tekniska beslut. Microservices i .NET och Azure.",
                Company = "TechCorp AB",
                Location = "Stockholm",
                IsRemote = false,
                Type = GigType.Contract,
                HourlyRate = "1000-1200 SEK",
                Duration = "12 månader",
                StartDate = DateTime.UtcNow.AddDays(30),
                Skills = new List<string> { ".NET", "Microservices", "Azure", "Team Leadership", "Agile" },
                CompetenceArea = "IT & Tech",
                PostedById = employers[0].Id,
                ExpiresAt = DateTime.UtcNow.AddDays(45)
            }
        };

        await context.Gigs.AddRangeAsync(gigs);
        await context.SaveChangesAsync();

        // Create some applications (accepted ones will count for leaderboard)
        var applications = new List<Application>
        {
            new Application
            {
                GigId = gigs[0].Id, // .NET Backend
                ApplicantId = candidates[0].Id, // Johan (freelance .NET)
                Status = ApplicationStatus.Accepted,
                Message = "Jag har 15 års erfarenhet av .NET och passar perfekt för detta uppdrag."
            },
            new Application
            {
                GigId = gigs[5].Id, // Solution Architect
                ApplicantId = candidates[4].Id, // Anders (Knowit)
                Status = ApplicationStatus.Accepted,
                Message = "Som arkitekt på Knowit har jag lett flera liknande projekt."
            },
            new Application
            {
                GigId = gigs[1].Id, // React Frontend
                ApplicantId = candidates[1].Id, // Sara (CGI)
                Status = ApplicationStatus.Accepted,
                Message = "React är min specialitet och jag har erfarenhet av bankapplikationer."
            },
            new Application
            {
                GigId = gigs[2].Id, // DevOps
                ApplicantId = candidates[2].Id, // Marcus (Capgemini)
                Status = ApplicationStatus.Accepted,
                Message = "Azure-migrering är precis vad jag gör på Capgemini just nu."
            },
            new Application
            {
                GigId = gigs[3].Id, // UX Designer
                ApplicantId = candidates[3].Id, // Emma (freelance)
                Status = ApplicationStatus.Accepted,
                Message = "E-handel och UX är min nisch!"
            },
            new Application
            {
                GigId = gigs[4].Id, // Data Engineer
                ApplicantId = candidates[5].Id, // Lisa (freelance)
                Status = ApplicationStatus.Accepted,
                Message = "Databricks och Spark är mina dagliga verktyg."
            },
            // Some additional completed gigs for Johan (to boost leaderboard)
            new Application
            {
                GigId = gigs[6].Id, // Full Stack
                ApplicantId = candidates[0].Id,
                Status = ApplicationStatus.Accepted,
                Message = "Full stack .NET och React - perfekt match!"
            },
            new Application
            {
                GigId = gigs[9].Id, // Tech Lead
                ApplicantId = candidates[0].Id,
                Status = ApplicationStatus.Accepted,
                Message = "Har lett flera teams tidigare."
            },
            // Some pending applications
            new Application
            {
                GigId = gigs[7].Id, // React Native
                ApplicantId = candidates[1].Id,
                Status = ApplicationStatus.Pending,
                Message = "Vill gärna utforska React Native."
            },
            new Application
            {
                GigId = gigs[8].Id, // Python Backend
                ApplicantId = candidates[5].Id,
                Status = ApplicationStatus.Pending,
                Message = "Python är mitt modersmål!"
            }
        };

        await context.Applications.AddRangeAsync(applications);
        await context.SaveChangesAsync();

        // Create reviews for candidates with accepted applications
        var reviews = new List<Review>
        {
            new Review
            {
                Rating = 5,
                Comment = "Fantastisk utvecklare! Johan levererade över förväntan och var en fröjd att jobba med.",
                ReviewerId = employers[0].Id,
                CandidateId = candidates[0].Id,
                GigId = gigs[0].Id
            },
            new Review
            {
                Rating = 5,
                Comment = "Utmärkt arkitekt som förstår affärsbehov. Rekommenderas starkt!",
                ReviewerId = employers[0].Id,
                CandidateId = candidates[4].Id,
                GigId = gigs[5].Id
            },
            new Review
            {
                Rating = 4,
                Comment = "Mycket kompetent React-utvecklare. Bra kommunikation.",
                ReviewerId = employers[1].Id,
                CandidateId = candidates[1].Id,
                GigId = gigs[1].Id
            },
            new Review
            {
                Rating = 5,
                Comment = "Marcus löste migreringen på rekordtid. Imponerad!",
                ReviewerId = employers[2].Id,
                CandidateId = candidates[2].Id,
                GigId = gigs[2].Id
            },
            new Review
            {
                Rating = 5,
                Comment = "Emma är en designer i världsklass. Våra konverteringar ökade 30%!",
                ReviewerId = employers[3].Id,
                CandidateId = candidates[3].Id,
                GigId = gigs[3].Id
            },
            new Review
            {
                Rating = 4,
                Comment = "Lisa byggde robusta pipelines. Bra dokumentation.",
                ReviewerId = employers[1].Id,
                CandidateId = candidates[5].Id,
                GigId = gigs[4].Id
            },
            // Additional reviews for Johan to boost rating
            new Review
            {
                Rating = 5,
                Comment = "Johan är vår go-to utvecklare nu. Tredje uppdraget tillsammans!",
                ReviewerId = employers[0].Id,
                CandidateId = candidates[0].Id,
                GigId = gigs[6].Id
            },
            new Review
            {
                Rating = 4,
                Comment = "Bra tech lead som får teamet att prestera.",
                ReviewerId = employers[0].Id,
                CandidateId = candidates[0].Id,
                GigId = gigs[9].Id
            }
        };

        await context.Reviews.AddRangeAsync(reviews);
        await context.SaveChangesAsync();
    }
}

