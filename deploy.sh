#!/bin/bash

# CryptoStream Deployment Script
# This script helps prepare the application for deployment

echo "🚀 CryptoStream Deployment Preparation"
echo "======================================"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install:all

echo "🔨 Building backend..."
cd backend
pnpm build
cd ..

echo "🔨 Building frontend..."
cd frontend
pnpm build
cd ..

echo "✅ Build completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Deploy backend to Railway:"
echo "   - Go to https://railway.app"
echo "   - Create new project from GitHub repo"
echo "   - Select 'backend' folder as root"
echo "   - Set environment variables (see DEPLOYMENT.md)"
echo ""
echo "2. Deploy frontend to Vercel:"
echo "   - Go to https://vercel.com"
echo "   - Import GitHub repository"
echo "   - Set root directory to 'frontend'"
echo "   - Set environment variables (see DEPLOYMENT.md)"
echo ""
echo "📖 For detailed instructions, see DEPLOYMENT.md"
