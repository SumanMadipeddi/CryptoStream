# CryptoStream Deployment Script (PowerShell)
# This script helps prepare the application for deployment

Write-Host "🚀 CryptoStream Deployment Preparation" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
pnpm install:all

Write-Host "🔨 Building backend..." -ForegroundColor Yellow
Set-Location backend
pnpm build
Set-Location ..

Write-Host "🔨 Building frontend..." -ForegroundColor Yellow
Set-Location frontend
pnpm build
Set-Location ..

Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Deploy backend to Railway:" -ForegroundColor White
Write-Host "   - Go to https://railway.app" -ForegroundColor Gray
Write-Host "   - Create new project from GitHub repo" -ForegroundColor Gray
Write-Host "   - Select 'backend' folder as root" -ForegroundColor Gray
Write-Host "   - Set environment variables (see DEPLOYMENT.md)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Deploy frontend to Vercel:" -ForegroundColor White
Write-Host "   - Go to https://vercel.com" -ForegroundColor Gray
Write-Host "   - Import GitHub repository" -ForegroundColor Gray
Write-Host "   - Set root directory to 'frontend'" -ForegroundColor Gray
Write-Host "   - Set environment variables (see DEPLOYMENT.md)" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 For detailed instructions, see DEPLOYMENT.md" -ForegroundColor Cyan
