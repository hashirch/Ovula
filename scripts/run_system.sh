#!/bin/bash

echo "=========================================="
echo "Starting PCOS Tracking System"
echo "=========================================="

# Check if Ollama is running
if ! pgrep -x "ollama" > /dev/null; then
    echo "⚠️  Ollama not running. Starting Ollama..."
    ollama serve &
    sleep 3
fi

# Check if Llama 3 model is available
if ! ollama list | grep -q "llama3"; then
    echo "📥 Downloading Llama 3 model..."
    ollama pull llama3
fi

echo ""
echo "🚀 Starting Backend..."
cd "$(dirname "$0")/../backend"
python3 main.py &
BACKEND_PID=$!
cd -

echo "⏳ Waiting for backend to start..."
sleep 5

echo ""
echo "🚀 Starting Frontend..."
cd "$(dirname "$0")/../frontend"
npm start &
FRONTEND_PID=$!
cd -

echo ""
echo "=========================================="
echo "✅ System Started!"
echo "=========================================="
echo ""
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend API: http://localhost:8000"
echo "📚 API Docs: http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo "=========================================="

# Wait for Ctrl+C
trap "echo ''; echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
