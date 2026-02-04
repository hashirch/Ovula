#!/bin/bash

echo "=========================================="
echo "Database Viewer"
echo "=========================================="
echo ""
echo "Choose what to view:"
echo ""
echo "1. SQLite Database (pcos_tracker.db)"
echo "2. Training Datasets (JSON files)"
echo "3. Both"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo "Opening SQLite database..."
        cd "$(dirname "$0")/.."
        if [ -f "backend/pcos_tracker.db" ]; then
            sqlitebrowser backend/pcos_tracker.db &
            echo "✅ Database opened in DB Browser"
        else
            echo "❌ Database not found. Run the backend first to create it."
            echo "   cd backend && python3 main.py"
        fi
        ;;
    2)
        echo ""
        echo "Opening training datasets..."
        cd "$(dirname "$0")/../data"
        
        echo ""
        echo "Available datasets:"
        ls -lh *.json *.jsonl 2>/dev/null
        
        echo ""
        echo "Opening in text editor..."
        if command -v code &> /dev/null; then
            code . &
            echo "✅ Opened in VS Code"
        elif command -v gedit &> /dev/null; then
            gedit *.json &
            echo "✅ Opened in gedit"
        else
            echo "Opening in default editor..."
            xdg-open . &
        fi
        ;;
    3)
        echo ""
        echo "Opening both..."
        
        # Open database
        cd "$(dirname "$0")/.."
        if [ -f "backend/pcos_tracker.db" ]; then
            sqlitebrowser backend/pcos_tracker.db &
            echo "✅ Database opened"
        fi
        
        # Open datasets
        cd data
        if command -v code &> /dev/null; then
            code . &
            echo "✅ Datasets opened in VS Code"
        else
            xdg-open . &
            echo "✅ Datasets folder opened"
        fi
        ;;
    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "=========================================="
