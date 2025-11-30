#!/bin/bash

echo "🚀 Starting Mentor AI Frontend..."
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚙️  Creating .env.local file..."
    echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
fi

echo ""
echo "✨ Starting development server..."
echo "🌐 Frontend will be available at http://localhost:3000"
echo "🔌 Make sure backend is running at http://localhost:8000"
echo ""

npm run dev
