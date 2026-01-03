# GigBoard Azure Deployment Guide

## Översikt

GigBoard deployeras till Azure med följande gratis-tier resurser:

| Resurs | Azure Tjänst | Tier | Begränsningar |
|--------|--------------|------|---------------|
| Backend API | Azure App Service | F1 (Free) | 60 min CPU/dag, 1 GB RAM |
| Frontend | Azure Static Web Apps | Free | 100 GB bandbredd/månad |
| Databas | Azure SQL Database | Free | 32 GB, 100K vCore sekunder/månad |

## Förutsättningar

1. **Azure CLI** installerat och inloggat
   ```powershell
   winget install Microsoft.AzureCLI
   az login
   ```

2. **Docker Desktop** (för lokal SQL Server)
   ```powershell
   winget install Docker.DockerDesktop
   ```

3. **.NET 8 SDK**
   ```powershell
   winget install Microsoft.DotNet.SDK.8
   ```

4. **Node.js 20+**
   ```powershell
   winget install OpenJS.NodeJS.LTS
   ```

## Lokal Utveckling med SQL Server

### Starta SQL Server med Docker

```powershell
# Starta SQL Server container
docker-compose up -d

# Verifiera att den körs
docker ps
```

SQL Server finns nu tillgänglig på `localhost,1433` med:
- **Användare:** sa
- **Lösenord:** GigBoard123!
- **Databas:** GigBoard (skapas automatiskt)

### Alternativ: SQL Server LocalDB (Windows)

Om du inte vill använda Docker, kan du använda SQL Server LocalDB:

```powershell
# Installera SQL Server Express LocalDB
winget install Microsoft.SQLServer.2022.Express

# Uppdatera connection string i appsettings.Development.json
```

Connection string för LocalDB:
```json
"DefaultConnection": "Server=(localdb)\\mssqllocaldb;Database=GigBoard;Trusted_Connection=True;MultipleActiveResultSets=true"
```

### Starta Backend

```powershell
cd backend/GigBoard.Api
dotnet run
```

API:t körs på `http://localhost:5107`

### Starta Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend körs på `http://localhost:5173`

## Azure Deployment

### Metod 1: PowerShell Script (Enkel)

```powershell
# Kör från projekt-root
$sqlPassword = Read-Host -AsSecureString "SQL Admin Password"
$jwtKey = Read-Host -AsSecureString "JWT Secret Key"

./azure/deploy-simple.ps1 `
    -ResourceGroupName "gigboard-rg" `
    -Location "swedencentral" `
    -SqlPassword $sqlPassword `
    -JwtKey $jwtKey
```

### Metod 2: GitHub Actions (CI/CD)

1. **Skapa GitHub Secrets:**

   Gå till ditt repo → Settings → Secrets and variables → Actions

   Lägg till följande secrets:

   | Secret | Beskrivning |
   |--------|-------------|
   | `AZURE_CREDENTIALS` | Azure Service Principal JSON |
   | `AZURE_WEBAPP_NAME` | App Service namn (från deployment output) |
   | `AZURE_STATIC_WEB_APPS_API_TOKEN` | Static Web Apps deployment token |
   | `SQL_ADMIN_PASSWORD` | SQL Server lösenord |
   | `JWT_KEY` | JWT signerings-nyckel (minst 32 tecken) |
   | `VITE_API_URL` | Backend API URL |

2. **Skapa Azure Service Principal:**

   ```powershell
   az ad sp create-for-rbac --name "gigboard-github" --role contributor `
       --scopes /subscriptions/{subscription-id}/resourceGroups/gigboard-rg `
       --sdk-auth
   ```

   Kopiera hela JSON-outputen till `AZURE_CREDENTIALS` secret.

3. **Få Static Web Apps token:**

   ```powershell
   az staticwebapp secrets list --name gigboard-web --query properties.apiKey -o tsv
   ```

4. **Kör Infrastructure Deployment:**

   Gå till Actions → "Deploy Azure Infrastructure" → Run workflow

5. **Deploy Backend/Frontend:**

   Push till `main` branch triggar automatiskt deployment.

### Metod 3: Manuell Bicep Deployment

```powershell
# Skapa resource group
az group create --name gigboard-rg --location swedencentral

# Deploya infrastruktur
az deployment group create `
    --resource-group gigboard-rg `
    --template-file azure/main.bicep `
    --parameters appName=gigboard `
                 location=swedencentral `
                 sqlAdminPassword="<your-password>" `
                 jwtKey="<your-jwt-key>"
```

## Konfiguration

### Miljövariabler (Backend - Azure App Service)

| Variabel | Beskrivning |
|----------|-------------|
| `ConnectionStrings__DefaultConnection` | SQL Server connection string |
| `Jwt__Key` | JWT signerings-nyckel |
| `Jwt__Issuer` | JWT issuer (default: GigBoard) |
| `Jwt__Audience` | JWT audience (default: GigBoard) |
| `Cors__Origins__0` | Tillåten CORS origin |

### Miljövariabler (Frontend - Build-time)

| Variabel | Beskrivning |
|----------|-------------|
| `VITE_API_URL` | Backend API bas-URL |

## Kostnadsuppskattning

Med Free Tier:
- **App Service F1:** 0 kr (60 min CPU/dag)
- **Static Web Apps Free:** 0 kr
- **Azure SQL Free:** 0 kr (första 100K vCore-sekunder/månad)

**Total kostnad: 0 kr/månad** (inom gränserna)

### Uppgradering

Om du behöver mer kapacitet:
- App Service B1: ~100 kr/månad
- Azure SQL Basic: ~50 kr/månad

## Felsökning

### "Database connection failed"

1. Kontrollera att SQL Server firewall tillåter Azure-tjänster
2. Verifiera connection string i App Service Configuration

```powershell
az webapp config connection-string list --name <app-name> --resource-group gigboard-rg
```

### "CORS error"

1. Lägg till frontend-URL i CORS-inställningar:

```powershell
az webapp cors add --name <app-name> --resource-group gigboard-rg --allowed-origins https://your-static-app.azurestaticapps.net
```

### "Free tier limit reached"

Azure SQL Free tier har begränsningar. Övervaka användning:

```powershell
az sql db show --name GigBoard --server <sql-server-name> --resource-group gigboard-rg --query "currentServiceObjectiveName"
```

## Databas Migrations

```powershell
cd backend/GigBoard.Api

# Skapa migration
dotnet ef migrations add <MigrationName>

# Applicera i Azure
$connStr = az webapp config connection-string list --name <app-name> -g gigboard-rg --query "[0].value" -o tsv
dotnet ef database update --connection "$connStr"
```

## Monitoring

### Application Insights (Valfritt)

Lägg till Application Insights för övervakning:

```powershell
az monitor app-insights component create `
    --app gigboard-insights `
    --location swedencentral `
    --resource-group gigboard-rg
```

### Loggar

```powershell
# Streaming logs
az webapp log tail --name <app-name> --resource-group gigboard-rg
```

