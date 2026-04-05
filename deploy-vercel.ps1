# Deploy to Vercel Script
Write-Host "Deploying All Pro to Vercel..." -ForegroundColor Cyan
Write-Host ""

# Check if Vercel CLI is installed
$vercelInstalled = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelInstalled) {
    Write-Host "Installing Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    Write-Host "Vercel CLI installed!" -ForegroundColor Green
    Write-Host ""
}

# Verify build succeeds before deploying
Write-Host "Running build check..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Build failed! Fix errors before deploying." -ForegroundColor Red
    exit 1
}
Write-Host "Build passed!" -ForegroundColor Green

# Check required environment variables for production
$requiredEnvVars = @(
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
)
Write-Host ""
Write-Host "Reminder: Ensure these env vars are set in Vercel dashboard:" -ForegroundColor Yellow
foreach ($envVar in $requiredEnvVars) {
    Write-Host "  - $envVar" -ForegroundColor Yellow
}
Write-Host "  - SUPABASE_SERVICE_ROLE_KEY (optional, for admin ops)" -ForegroundColor Yellow
Write-Host "  - GEMINI_API_KEY (optional, for AI features)" -ForegroundColor Yellow
Write-Host ""

# Login to Vercel
Write-Host "Logging in to Vercel..." -ForegroundColor Cyan
vercel login

# Deploy to production
Write-Host ""
Write-Host "Deploying to production..." -ForegroundColor Cyan
vercel --prod

Write-Host ""
Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Your app is now live on Vercel!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "   1. Verify environment variables in Vercel dashboard"
Write-Host "   2. Configure custom domain (optional)"
Write-Host "   3. Check analytics at https://vercel.com"
Write-Host ""
