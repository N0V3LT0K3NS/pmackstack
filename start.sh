#!/bin/bash

# Kill any existing processes on our ports
echo "Cleaning up existing processes..."
lsof -ti:3002 | xargs kill -9 2>/dev/null
lsof -ti:5174 | xargs kill -9 2>/dev/null
lsof -ti:5175 | xargs kill -9 2>/dev/null
lsof -ti:5176 | xargs kill -9 2>/dev/null

# Start backend server
echo "Starting backend server on port 3002..."
(cd server && npm run dev) &
BACKEND_PID=$!

# Wait a moment for backend to start
sleep 2

# Start frontend server
echo "Starting frontend server..."
(cd client && npm run dev) &
FRONTEND_PID=$!

echo "Executive Dashboard is starting..."
echo "Backend: http://localhost:3002"
echo "Frontend: http://localhost:5174 (or next available port)"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait 