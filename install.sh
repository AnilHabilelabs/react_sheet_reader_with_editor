#!/bin/bash

# Navigate to the backend directory
cd backend

# Install backend dependencies
echo "Installing backend dependencies..."
npm install

# Navigate back to the root directory
cd ..

# Navigate to the frontend directory
cd frontend

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

# Navigate back to the root directory
cd ..

echo "Installation completed for both backend and frontend."
