#!/bin/bash
# Ovula Production Startup Script
# Runs on server: 121.52.146.108

export PATH="$HOME/.local/bin:$HOME/bin:$HOME/bin/bin:$PATH"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
export OLLAMA_MODELS="$HOME/.ollama/models"
export OLLAMA_BIN="$HOME/.local/bin/ollama"
export OVULA_DIR="$HOME/ovula"

echo "================================================"
echo "  Ovula Production - Starting All Services"
echo "================================================"

# ------- 1. Kill existing screens -------
echo "[1/4] Cleaning up old screen sessions..."
screen -S ollama  -X quit 2>/dev/null || true
screen -S backend -X quit 2>/dev/null || true
screen -S frontend -X quit 2>/dev/null || true
# Kill any stray processes
pkill -f "ollama serve" 2>/dev/null || true
fuser -k 8001/tcp 2>/dev/null || true
sleep 2

# ------- 2. Start Ollama -------
echo "[2/4] Starting Ollama LLM server..."
screen -dmS ollama bash -c "
  export PATH=$HOME/.local/bin:$HOME/bin:\$PATH
  export OLLAMA_MODELS=$HOME/.ollama/models
  $HOME/.local/bin/ollama serve 2>&1 | tee ~/ollama.log
"
sleep 6

# Wait for Ollama to be ready (up to 30s)
echo "Waiting for Ollama to become ready..."
for i in {1..15}; do
    if curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
        echo "  ✅ Ollama is up!"
        break
    fi
    echo "  Attempt $i/15 — waiting..."
    sleep 2
done

# Create PCOS models (safe to re-run — won't duplicate)
echo "Creating pcos-base model..."
$HOME/.local/bin/ollama create pcos-base -f $OVULA_DIR/ml-models/Modelfile_Base_PCOS 2>&1 || echo "  (pcos-base may already exist — OK)"

echo "Creating pcos-llama3 model..."
$HOME/.local/bin/ollama create pcos-llama3 -f $OVULA_DIR/ml-models/Modelfile_PCOS 2>&1 || echo "  (pcos-llama3 may already exist — OK)"

echo "Available Ollama models:"
$HOME/.local/bin/ollama list 2>&1

# ------- 3. Start Backend -------
echo ""
echo "[3/4] Starting FastAPI backend..."
screen -dmS backend bash -c "
  export PATH=$HOME/.local/bin:$HOME/bin:\$PATH
  cd $OVULA_DIR/backend
  python3 main.py 2>&1 | tee ~/backend.log
"
sleep 4

# Quick backend check
if curl -s http://localhost:8001/ > /dev/null 2>&1; then
    echo "  ✅ Backend is responding"
else
    echo "  ⏳ Backend starting (may take a moment)..."
fi

# ------- 4. Start Frontend -------
echo ""
echo "[4/4] Starting React frontend static server..."
screen -dmS frontend bash -c "
  export PATH=$HOME/.local/bin:$HOME/bin:\$PATH
  export NVM_DIR=$HOME/.nvm
  [ -s \$NVM_DIR/nvm.sh ] && . \$NVM_DIR/nvm.sh
  serve -s $OVULA_DIR/frontend/build -l 3000 2>&1 | tee ~/frontend.log
"
sleep 5

echo ""
echo "================================================"
echo "  Status Check"
echo "================================================"
screen -list
echo ""
echo "Services should be available at:"
echo "  Backend API:  http://121.52.146.108:8001"
echo "  API Docs:     http://121.52.146.108:8001/docs"
echo "  Web Frontend: http://121.52.146.108:3000"
echo ""
echo "Check logs with:"
echo "  tail -f ~/backend.log"
echo "  tail -f ~/frontend.log"
echo "  tail -f ~/ollama.log"
