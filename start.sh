#!/bin/bash

# Navigate to the backend directory
cd backend

# Install backend dependencies
echo "starting backend server..."
npm start &

# Wait for a moment to allow the backend server to initialize
sleep 5

echo "backend server running on port 5399"

# Navigate back to the root directory
cd ..

# Navigate to the frontend directory
cd frontend

# Install frontend dependencies
echo "starting frontend server"
PORT=5398 npm start

# Navigate back to the root directory
cd ..

echo "frontend server running on"
