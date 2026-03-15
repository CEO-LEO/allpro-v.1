@echo off
REM =====================================================
REM All Pro - Quick Setup Script for Windows
REM =====================================================

echo.
echo ================================================
echo    All Pro - QUICK SETUP
echo ================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] Checking Node.js version...
node --version
echo.

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm not found!
    pause
    exit /b 1
)

echo [2/5] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed!
    pause
    exit /b 1
)
echo.

echo [3/5] Verifying setup...
call node verify-setup.js
echo.

echo [4/5] Checking .env.local file...
if exist .env.local (
    echo [OK] .env.local found
) else (
    echo [WARNING] .env.local not found!
    echo Creating from .env.example...
    if exist .env.example (
        copy .env.example .env.local
        echo [OK] .env.local created from .env.example
        echo Please edit .env.local and add your Supabase keys
    ) else (
        echo [ERROR] .env.example not found!
    )
)
echo.

echo [5/5] Setup complete!
echo.
echo ================================================
echo    NEXT STEPS:
echo ================================================
echo.
echo 1. Open Supabase Dashboard (https://supabase.com/dashboard)
echo 2. Run SQL: supabase/SETUP_DATABASE.sql
echo 3. Run SQL: supabase/MOCK_PRODUCTS.sql (optional)
echo 4. Create Storage bucket: "promotions" (Public)
echo 5. Edit .env.local and add SUPABASE_SERVICE_ROLE_KEY
echo.
echo To start the development server, run:
echo    npm run dev
echo.
echo Documentation:
echo    • QUICKSTART.md - Quick setup guide
echo    • PRODUCTION_SETUP.md - Production deployment
echo    • FIXES_SUMMARY.md - Recent changes
echo.
echo ================================================
echo.

pause
