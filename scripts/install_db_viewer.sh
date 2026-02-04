#!/bin/bash

echo "=========================================="
echo "Installing Database Viewer"
echo "=========================================="

# Check if running on Ubuntu/Debian
if command -v apt &> /dev/null; then
    echo "📦 Installing DB Browser for SQLite..."
    sudo apt update
    sudo apt install -y sqlitebrowser
    
    echo ""
    echo "✅ DB Browser for SQLite installed!"
    echo ""
    echo "To open the database:"
    echo "  sqlitebrowser backend/pcos_tracker.db"
    echo ""
    echo "Or launch from applications menu: 'DB Browser for SQLite'"
    
elif command -v dnf &> /dev/null; then
    echo "📦 Installing DB Browser for SQLite..."
    sudo dnf install -y sqlitebrowser
    
    echo ""
    echo "✅ DB Browser for SQLite installed!"
    
elif command -v pacman &> /dev/null; then
    echo "📦 Installing DB Browser for SQLite..."
    sudo pacman -S --noconfirm sqlitebrowser
    
    echo ""
    echo "✅ DB Browser for SQLite installed!"
    
else
    echo "❌ Unsupported package manager"
    echo ""
    echo "Please install DB Browser for SQLite manually:"
    echo "  https://sqlitebrowser.org/dl/"
    exit 1
fi

echo ""
echo "=========================================="
echo "🎉 Installation Complete!"
echo "=========================================="
