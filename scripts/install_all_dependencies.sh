#!/bin/bash

echo "=========================================="
echo "Installing All Dependencies Locally"
echo "=========================================="

# Backend Python Dependencies
echo ""
echo "📦 Installing Backend Python Dependencies..."
echo "=========================================="

pip3 install --break-system-packages \
    fastapi \
    uvicorn \
    sqlalchemy \
    pydantic \
    pydantic-settings \
    python-jose \
    passlib \
    bcrypt \
    python-multipart \
    requests \
    ollama

echo "✅ Backend dependencies installed"

# Frontend Node Dependencies
echo ""
echo "📦 Installing Frontend Node Dependencies..."
echo "=========================================="

cd "$(dirname "$0")/../frontend"
npm install
cd -

echo "✅ Frontend dependencies installed"

echo ""
echo "=========================================="
echo "✅ All Dependencies Installed!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Start backend: cd backend && python3 main.py"
echo "2. Start frontend: cd frontend && npm start"
echo "3. Or use: ./run_system.sh"
