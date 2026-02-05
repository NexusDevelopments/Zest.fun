#!/bin/bash

# Zest.fun Quick Deploy Script
# Deploys the frontend to Vercel

echo "🚀 Zest.fun Vercel Deployment"
echo "=============================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "⚠️  Vercel CLI not found. Installing..."
    npm i -g vercel
fi

echo "📋 Pre-deployment checklist:"
echo ""

# Check if we're in a git repo
if [ -d .git ]; then
    echo "✅ Git repository detected"
    
    # Check for uncommitted changes
    if [[ -n $(git status -s) ]]; then
        echo "⚠️  You have uncommitted changes"
        read -p "   Commit changes before deployment? (y/n) " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add .
            read -p "   Enter commit message: " commit_msg
            git commit -m "$commit_msg"
            git push
        fi
    else
        echo "✅ No uncommitted changes"
    fi
else
    echo "⚠️  Not a git repository"
    read -p "   Initialize git? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git init
        git add .
        git commit -m "Initial commit - Ready for Vercel"
        echo "   Please push to GitHub before deploying"
        exit 0
    fi
fi

echo ""
echo "🔍 Checking build..."

# Test build
if npm run build; then
    echo "✅ Build successful"
else
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

echo ""
echo "🌐 Deployment options:"
echo ""
echo "1. Deploy to preview (test deployment)"
echo "2. Deploy to production"
echo "3. Cancel"
echo ""

read -p "Choose option (1-3): " -n 1 -r
echo ""

case $REPLY in
    1)
        echo "📤 Deploying to preview..."
        vercel
        ;;
    2)
        echo "📤 Deploying to production..."
        vercel --prod
        ;;
    3)
        echo "❌ Deployment cancelled"
        exit 0
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "✅ Deployment complete!"
echo ""
echo "💡 Pro tips:"
echo "   • Set environment variables in Vercel Dashboard"
echo "   • Add custom domain in Project Settings"
echo "   • Enable Analytics for insights"
echo ""
echo "📖 Full guide: See DEPLOY.md"
