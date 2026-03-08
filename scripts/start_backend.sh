#!/bin/bash
# Start PCOS Tracking System - Backend Server

echo "=========================================="
echo "Starting PCOS Tracking System Backend"
echo "=========================================="
echo ""

# Get the script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

# Check if Ollama is running
echo "Checking Ollama status..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is running"
else
    echo "⚠️  Ollama is not running. Starting Ollama..."
    ollama serve > /dev/null 2>&1 &
    sleep 3
    echo "✅ Ollama started"
fi

# Check if required models exist
echo ""
echo "Checking AI models..."
if ollama list | grep -q "pcos-base"; then
    echo "✅ pcos-base model found"
else
    echo "❌ pcos-base model not found"
    echo "Please run: ollama create pcos-base -f $PROJECT_ROOT/src/ml-models/Modelfile_Base_PCOS"
    exit 1
fi

# Navigate to backend directory
cd "$PROJECT_ROOT/src/backend"

# Check if virtual environment exists
if [ -d "venv" ]; then
    echo ""
    echo "Activating virtual environment..."
    source venv/bin/activate
fi

# Install dependencies if needed
if [ ! -f ".dependencies_installed" ]; then
    echo ""
    echo "Installing dependencies..."
    pip3 install -r requirements.txt --break-system-packages
    touch .dependencies_installed
fi

# Start the backend server
echo ""
echo "=========================================="
echo "Starting Backend Server..."
echo "=========================================="
echo ""
echo "Backend will be available at:"
echo "  - API: http://localhost:8000"
echo "  - Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python3 main.py
