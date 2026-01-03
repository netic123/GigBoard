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
- Entity Framework Core med SQLite
- JWT-baserad autentisering
- LinkedIn OAuth 2.0
- MailKit för email-notifikationer

### Frontend
- React 18 med TypeScript
- Vite som bundler
- Tailwind CSS 4
- React Router

## Komma igång

### 1. Backend

```bash
cd backend/GigBoard.Api

# Konfigurera appsettings.json med dina LinkedIn OAuth credentials
# och SMTP-inställningar för email

dotnet run --urls "http://localhost:5000"
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Öppna http://localhost:5173 i din webbläsare.

## Konfiguration

### LinkedIn OAuth

1. Skapa en app på https://www.linkedin.com/developers/
2. Lägg till redirect URI: `http://localhost:5173/login/callback`
3. Uppdatera `appsettings.json` med ClientId och ClientSecret
4. Skapa `.env` i frontend med `VITE_LINKEDIN_CLIENT_ID`

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

Projektet är förberett för deployment till Azure App Service.

```bash
# Bygg för produktion
cd backend/GigBoard.Api
dotnet publish -c Release -o ./publish

# Frontend byggs och läggs i wwwroot
cd frontend
npm run build
cp -r dist/* ../backend/GigBoard.Api/publish/wwwroot/
```

## Licens

MIT

