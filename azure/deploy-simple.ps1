# Simple deployment script for GigBoard to Azure
# Run this from the project root directory

param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroupName,
    
    [Parameter(Mandatory=$false)]
    [string]$Location = "swedencentral",
    
    [Parameter(Mandatory=$true)]
    [SecureString]$SqlPassword,
    
    [Parameter(Mandatory=$true)]
    [SecureString]$JwtKey
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "GigBoard Azure Deployment" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if logged in to Azure
$context = az account show 2>$null | ConvertFrom-Json
if (-not $context) {
    Write-Host "Not logged in to Azure. Running az login..." -ForegroundColor Yellow
    az login
}

Write-Host "Using subscription: $($context.name)" -ForegroundColor Green

# Create resource group if it doesn't exist
Write-Host "`nCreating resource group '$ResourceGroupName' in '$Location'..." -ForegroundColor Yellow
az group create --name $ResourceGroupName --location $Location

# Convert secure strings to plain text for Azure CLI
$sqlPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($SqlPassword))
$jwtKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($JwtKey))

# Deploy infrastructure
Write-Host "`nDeploying Azure infrastructure..." -ForegroundColor Yellow
$deployment = az deployment group create `
    --resource-group $ResourceGroupName `
    --template-file azure/main.bicep `
    --parameters appName=gigboard `
                 location=$Location `
                 sqlAdminPassword=$sqlPasswordPlain `
                 jwtKey=$jwtKeyPlain `
    --query properties.outputs `
    | ConvertFrom-Json

if (-not $deployment) {
    Write-Host "Deployment failed!" -ForegroundColor Red
    exit 1
}

$apiAppName = $deployment.apiAppName.value
$staticWebAppName = $deployment.staticWebAppName.value
$apiUrl = $deployment.apiAppUrl.value
$webUrl = $deployment.staticWebAppUrl.value

Write-Host "`nInfrastructure deployed successfully!" -ForegroundColor Green
Write-Host "API App: $apiAppName" -ForegroundColor Cyan
Write-Host "Static Web App: $staticWebAppName" -ForegroundColor Cyan

# Build and deploy backend
Write-Host "`nBuilding backend..." -ForegroundColor Yellow
Push-Location backend/GigBoard.Api
dotnet publish -c Release -o ./publish
Pop-Location

Write-Host "`nDeploying backend to Azure App Service..." -ForegroundColor Yellow
Compress-Archive -Path backend/GigBoard.Api/publish/* -DestinationPath backend/GigBoard.Api/publish.zip -Force
az webapp deployment source config-zip `
    --resource-group $ResourceGroupName `
    --name $apiAppName `
    --src backend/GigBoard.Api/publish.zip

# Update CORS settings for backend
Write-Host "`nConfiguring CORS..." -ForegroundColor Yellow
az webapp cors add `
    --resource-group $ResourceGroupName `
    --name $apiAppName `
    --allowed-origins $webUrl "http://localhost:5173"

# Build frontend
Write-Host "`nBuilding frontend..." -ForegroundColor Yellow
Push-Location frontend

# Create production environment file
@"
VITE_API_URL=$apiUrl
"@ | Out-File -FilePath .env.production -Encoding utf8

npm ci
npm run build
Pop-Location

# Get deployment token for Static Web App
Write-Host "`nGetting Static Web App deployment token..." -ForegroundColor Yellow
$deploymentToken = az staticwebapp secrets list `
    --name $staticWebAppName `
    --resource-group $ResourceGroupName `
    --query properties.apiKey -o tsv

# Deploy frontend using SWA CLI
Write-Host "`nDeploying frontend to Azure Static Web Apps..." -ForegroundColor Yellow
npx --yes @azure/static-web-apps-cli deploy frontend/dist `
    --deployment-token $deploymentToken `
    --env production

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "Deployment Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "API URL: $apiUrl" -ForegroundColor Cyan
Write-Host "Web URL: $webUrl" -ForegroundColor Cyan
Write-Host "`nNote: It may take a few minutes for the database to initialize." -ForegroundColor Yellow

