#!/bin/bash
# Start PCOS Tracking System - Frontend Application

echo "=========================================="
echo "Starting PCOS Tracking System Frontend"
echo "=========================================="
echo ""

# Get the script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Navigate to frontend directory
cd "$PROJECT_ROOT/src/frontend"

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
