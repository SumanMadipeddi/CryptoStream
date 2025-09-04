# CryptoStream Render Deployment Script (PowerShell)
# This script helps prepare the application for Render deployment

Write-Host "🚀 CryptoStream Render Deployment Preparation" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
Set-Location backend
pnpm install --frozen-lockfile
Set-Location ..

Write-Host "🔨 Building frontend..." -ForegroundColor Yellow
Set-Location frontend
pnpm build
Set-Location ..

Write-Host "✅ Build completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps for Render deployment:" -ForegroundColor Cyan
Write-Host "1. Deploy backend to Render:" -ForegroundColor White
Write-Host "   - Go to https://render.com" -ForegroundColor Gray
Write-Host "   - Create new Web Service from GitHub repo" -ForegroundColor Gray
Write-Host "   - Select 'backend' folder as root directory" -ForegroundColor Gray
Write-Host "   - Use 'backend/Dockerfile.render' as Dockerfile" -ForegroundColor Gray
Write-Host "   - Set environment variables (see RENDER-DEPLOYMENT.md)" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Deploy frontend to Vercel:" -ForegroundColor White
Write-Host "   - Go to https://vercel.com" -ForegroundColor Gray
Write-Host "   - Import GitHub repository" -ForegroundColor Gray
Write-Host "   - Set root directory to 'frontend'" -ForegroundColor Gray
Write-Host "   - Set environment variables with your Render URL" -ForegroundColor Gray
Write-Host ""
Write-Host "📖 For detailed instructions, see RENDER-DEPLOYMENT.md" -ForegroundColor Cyan
