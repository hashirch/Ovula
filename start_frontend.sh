#!/bin/bash
# Start PCOS Tracking System - Frontend Application

echo "=========================================="
echo "Starting PCOS Tracking System Frontend"
echo "=========================================="
echo ""

# Navigate to frontend directory
cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    echo "This may take a few minutes..."
    echo ""
    npm install
    echo ""
    echo "✅ Dependencies installed"
fi

# Start the frontend server
echo ""
echo "=========================================="
echo "Starting Frontend Application..."
echo "=========================================="
echo ""
echo "Frontend will be available at:"
echo "  - Local: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm start
