#!/bin/bash

echo "🚀 Starting Project Pluto - Cryptocurrency Price Tracker"
echo "=================================================="

# Check if pnpm is installed
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed. Please install pnpm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install --recursive

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Start backend server in background
echo "🔧 Starting backend server..."
cd backend
pnpm start &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
echo "⏳ Waiting for backend to initialize..."
sleep 5

# Start frontend server in background
echo "🎨 Starting frontend server..."
cd frontend
pnpm dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "🎉 Application started successfully!"
echo "=================================================="
echo "📊 Backend API: http://localhost:3001"
echo "🌐 Frontend UI: http://localhost:3000"
echo "🔌 WebSocket: ws://localhost:3002"
echo ""
echo "📝 Instructions:"
echo "1. Open http://localhost:3000 in your browser"
echo "2. Add tickers like BTCUSD, ETHUSD, SOLUSD"
echo "3. Watch real-time price updates"
echo "4. Remove tickers as needed"
echo ""
echo "⚠️  Note: Playwright will open in headed mode for scraping"
echo "Press Ctrl+C to stop all servers"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "✅ All servers stopped"
    exit 0
}

# Trap Ctrl+C
trap cleanup SIGINT

# Wait for user to stop
wait
