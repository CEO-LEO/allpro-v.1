# Deploy to Vercel Script
Write-Host "🚀 Deploying All Pro to Vercel..." -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "📦 Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "✅ Vercel CLI installed!" -ForegroundColor Green
    Write-Host ""
}

# Login to Vercel
Write-Host "🔐 Logging in to Vercel..." -ForegroundColor Cyan
vercel login

# Deploy to production
Write-Host ""
Write-Host "🌐 Deploying to production..." -ForegroundColor Cyan
vercel --prod

Write-Host ""
Write-Host "✨ Deployment complete!" -ForegroundColor Green
Write-Host "📱 Your app is now live on Vercel!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Set up environment variables in Vercel dashboard"
Write-Host "   2. Configure custom domain (optional)"
Write-Host "   3. Check analytics at https://vercel.com"
Write-Host ""
