#!/bin/bash

echo "======================================"
echo "  PCOS Tracking System - Status Check"
echo "======================================"
echo ""

# Check Backend
echo "🔍 Checking Backend..."
if curl -s http://localhost:8000/health > /dev/null 2>&1; then
    echo "✅ Backend is running on http://localhost:8000"
    curl -s http://localhost:8000/health | python3 -m json.tool
else
    echo "❌ Backend is not responding"
fi
echo ""

# Check Frontend
echo "🔍 Checking Frontend..."
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Frontend is running on http://localhost:3000"
else
    echo "❌ Frontend is not responding"
fi
echo ""

# Check Ollama
echo "🔍 Checking Ollama..."
if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo "✅ Ollama is running on http://localhost:11434"
    echo ""
    echo "📦 Installed Models:"
    ollama list
else
    echo "❌ Ollama is not responding"
    echo "   Run: ollama serve"
fi
echo ""

# Check Database
echo "🔍 Checking Database..."
if [ -f "backend/pcos_tracker.db" ]; then
    echo "✅ Database exists: backend/pcos_tracker.db"
    DB_SIZE=$(du -h backend/pcos_tracker.db | cut -f1)
    echo "   Size: $DB_SIZE"
else
    echo "❌ Database not found"
fi
echo ""

echo "======================================"
echo "  Quick Links"
echo "======================================"
echo "Frontend:  http://localhost:3000"
echo "Backend:   http://localhost:8000"
echo "API Docs:  http://localhost:8000/docs"
echo "Ollama:    http://localhost:11434"
echo ""
echo "======================================"
