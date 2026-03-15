#!/bin/bash
# 🚀 Quick Deploy Script
# All Pro x Fastwork

echo "🎯 Starting deployment process..."
echo ""

# Step 1: Add all files
echo "📦 Step 1: Adding files to Git..."
git add .

# Step 2: Commit
echo "💾 Step 2: Committing changes..."
git commit -m "🎉 MVP Complete: All Features Ready for Production"

# Step 3: Push to GitHub (ถ้ามี remote)
echo "🚀 Step 3: Pushing to GitHub..."
git push origin main 2>/dev/null || echo "⚠️ No remote set. Please add GitHub remote first."

echo ""
echo "✅ Done! Next: Deploy on Vercel"
echo "👉 Go to: https://vercel.com"
echo "👉 Import your GitHub repo"
echo "👉 Add environment variables"
echo "👉 Click Deploy!"
