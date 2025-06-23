#!/bin/bash

echo "🚀 Setting up Kilwins Executive Dashboard..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  No .env file found. Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file. Please update it with your database credentials."
    echo ""
fi

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install

# Setup Tailwind CSS
echo "🎨 Setting up Tailwind CSS..."
npx tailwindcss init -p

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update the .env file with your database URL"
echo "2. Run 'npm run dev' in the server directory (terminal 1)"
echo "3. Run 'npm run dev' in the client directory (terminal 2)"
echo ""
echo "Server will run on: http://localhost:3002"
echo "Client will run on: http://localhost:5174" 