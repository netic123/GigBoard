# GigBoard

En enkel och minimalistisk plattform för att hitta och publicera konsultuppdrag och frilansuppdrag.

## Funktioner

### För sökande (kandidater)
- Bläddra bland uppdrag utan att logga in
- Sök och filtrera på kompetensområde
- Visa uppdragsdetaljer
- Ansök med LinkedIn-inloggning (din profil skickas till uppdragsgivaren)

### För uppdragsgivare
- Registrera konto med email/lösenord
- Skapa och hantera uppdrag
- Se alla ansökningar med LinkedIn-profilinformation
- Få mailnotifikation när någon ansöker

## Tech Stack

### Backend
- .NET 8 Web API
- Entity Framework Core med SQL Server
- JWT-baserad autentisering
- LinkedIn OAuth 2.0
- MailKit för email-notifikationer

### Frontend
- React 19 med TypeScript
- Vite som bundler
- Tailwind CSS 4
- React Router

### Azure (Produktion)
- Azure App Service (Free F1)
- Azure Static Web Apps (Free)
- Azure SQL Database (Free tier)

## Snabbstart

### Förutsättningar

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (för SQL Server)
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Node.js 20+](https://nodejs.org/)

### 1. Starta SQL Server

```powershell
# Starta SQL Server container
docker-compose up -d

# Verifiera att den körs
docker ps
```

### 2. Starta Backend

```powershell
cd backend/GigBoard.Api
dotnet run
```

API:t körs på `http://localhost:5107`

### 3. Starta Frontend

```powershell
cd frontend
npm install
npm run dev
```

Öppna http://localhost:5173 i din webbläsare.

## Alternativ: SQL Server LocalDB (Windows)

Om du inte vill använda Docker:

1. Installera SQL Server Express LocalDB
2. Uppdatera connection string i `appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=GigBoard;Trusted_Connection=True;MultipleActiveResultSets=true"
  }
}
```

## Konfiguration

### LinkedIn OAuth

1. Skapa en app på https://www.linkedin.com/developers/
2. Lägg till redirect URI: `http://localhost:5173/login/callback`
3. Uppdatera `appsettings.json` med ClientId och ClientSecret

### Email (SMTP)

Konfigurera SMTP-inställningar i `appsettings.json`:

```json
{
  "Smtp": {
    "Host": "smtp.example.com",
    "Port": "587",
    "User": "your-email@example.com",
    "Password": "your-password",
    "From": "noreply@gigboard.se"
  }
}
```

## Azure Deployment

Se [AZURE_DEPLOYMENT.md](./AZURE_DEPLOYMENT.md) för detaljerade instruktioner.

### Snabb-deploy med PowerShell

```powershell
$sqlPassword = Read-Host -AsSecureString "SQL Admin Password"
$jwtKey = Read-Host -AsSecureString "JWT Secret Key"

./azure/deploy-simple.ps1 `
    -ResourceGroupName "gigboard-rg" `
    -Location "swedencentral" `
    -SqlPassword $sqlPassword `
    -JwtKey $jwtKey
```

### Med GitHub Actions

1. Konfigurera secrets i GitHub (se AZURE_DEPLOYMENT.md)
2. Kör "Deploy Azure Infrastructure" workflow
3. Push till `main` branch för automatisk deployment

## Kostnader

Med Azure Free Tier:
- **App Service F1:** 0 kr (60 min CPU/dag)
- **Static Web Apps Free:** 0 kr
- **Azure SQL Free:** 0 kr (32 GB, första 100K vCore-sekunder/månad)

**Total: 0 kr/månad** (inom gränserna)

## Projektstruktur

```
GigBoard/
├── backend/
│   └── GigBoard.Api/           # .NET 8 Web API
│       ├── Controllers/        # API endpoints
│       ├── Data/               # EF Core DbContext
│       ├── DTOs/               # Data transfer objects
│       ├── Models/             # Entity models
│       └── Services/           # Business logic
├── frontend/
│   └── src/
│       ├── components/         # React komponenter
│       ├── context/            # React context (auth)
│       ├── pages/              # Sidor/routes
│       ├── services/           # API-anrop
│       └── types/              # TypeScript typer
├── azure/                      # Azure deployment filer
│   ├── main.bicep              # Infrastructure as Code
│   └── deploy-simple.ps1       # Deployment script
└── .github/workflows/          # CI/CD pipelines
```

## Licens

MIT
