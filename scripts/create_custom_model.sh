#!/bin/bash

echo "=========================================="
echo "Creating Custom PCOS Assistant Model"
echo "=========================================="

cd "$(dirname "$0")/.."

echo ""
echo "📦 Building custom model from Modelfile..."
echo "This will create a fine-tuned version optimized for PCOS conversations"
echo ""

# Create the custom model
ollama create pcos-assistant -f Modelfile

if [ $? -eq 0 ]; then
    echo ""
    echo "=========================================="
    echo "✅ Custom Model Created Successfully!"
    echo "=========================================="
    echo ""
    echo "Model name: pcos-assistant"
    echo ""
    echo "To test the model:"
    echo "  ollama run pcos-assistant"
    echo ""
    echo "To use in your app:"
    echo "  1. Edit backend/.env"
    echo "  2. Change: OLLAMA_BASE_MODEL=pcos-assistant"
    echo "  3. Restart backend: cd backend && python3 main.py"
    echo ""
    echo "=========================================="
else
    echo ""
    echo "❌ Failed to create model"
    echo "Make sure Ollama is running: ollama serve"
    exit 1
fi
