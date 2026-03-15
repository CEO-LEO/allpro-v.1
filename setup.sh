#!/bin/bash

# =====================================================
# All Pro - Quick Setup Script for Mac/Linux
# =====================================================

echo ""
echo "================================================"
echo "   All Pro - QUICK SETUP"
echo "================================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "[ERROR] Node.js not found!"
    echo "Please install Node.js from: https://nodejs.org/"
    exit 1
fi

echo "[1/5] Checking Node.js version..."
node --version
echo ""

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "[ERROR] npm not found!"
    exit 1
fi

echo "[2/5] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] npm install failed!"
    exit 1
fi
echo ""

echo "[3/5] Verifying setup..."
node verify-setup.js
echo ""

echo "[4/5] Checking .env.local file..."
if [ -f ".env.local" ]; then
    echo "[OK] .env.local found"
else
    echo "[WARNING] .env.local not found!"
    if [ -f ".env.example" ]; then
        cp .env.example .env.local
        echo "[OK] .env.local created from .env.example"
        echo "Please edit .env.local and add your Supabase keys"
    else
        echo "[ERROR] .env.example not found!"
    fi
fi
echo ""

echo "[5/5] Setup complete!"
echo ""
echo "================================================"
echo "   NEXT STEPS:"
echo "================================================"
echo ""
echo "1. Open Supabase Dashboard (https://supabase.com/dashboard)"
echo "2. Run SQL: supabase/SETUP_DATABASE.sql"
echo "3. Run SQL: supabase/MOCK_PRODUCTS.sql (optional)"
echo "4. Create Storage bucket: 'promotions' (Public)"
echo "5. Edit .env.local and add SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "To start the development server, run:"
echo "   npm run dev"
echo ""
echo "Documentation:"
echo "   • QUICKSTART.md - Quick setup guide"
echo "   • PRODUCTION_SETUP.md - Production deployment"
echo "   • FIXES_SUMMARY.md - Recent changes"
echo ""
echo "================================================"
echo ""
