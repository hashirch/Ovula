#!/bin/bash

# Ovula Android App - Build and Run Script

echo "🚀 Ovula Android App - Build and Run"
echo "===================================="
echo ""

# Set Android SDK path
export ANDROID_HOME=~/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/platform-tools:$ANDROID_HOME/tools

# Check if device is connected
echo "📱 Checking for connected devices..."
adb devices -l

DEVICE_COUNT=$(adb devices | grep -v "List" | grep "device" | wc -l)

if [ $DEVICE_COUNT -eq 0 ]; then
    echo ""
    echo "❌ No authorized devices found!"
    echo ""
    echo "Please authorize USB debugging on your device:"
    echo "1. Go to Settings → About Phone"
    echo "2. Tap Build Number 7 times"
    echo "3. Go to Settings → Developer Options"
    echo "4. Enable USB Debugging"
    echo "5. Accept the authorization popup on your phone"
    echo ""
    exit 1
fi

echo ""
echo "✅ Device found!"
echo ""

# Check if backend is running
echo "🔍 Checking if backend is running..."
if curl -s http://localhost:8000/docs > /dev/null 2>&1; then
    echo "✅ Backend is running at http://localhost:8000"
else
    echo "⚠️  Backend is not running!"
    echo ""
    echo "Please start the backend first:"
    echo "  cd src/backend"
    echo "  source venv/bin/activate"
    echo "  uvicorn main:app --reload --host 0.0.0.0 --port 8000"
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

echo ""
echo "🔨 Building the app..."
echo ""

# Clean previous builds
./gradlew clean

# Build the app
./gradlew assembleDebug

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Build failed!"
    exit 1
fi

echo ""
echo "✅ Build successful!"
echo ""
echo "📲 Installing app on device..."
echo ""

# Install the app
adb install -r app/build/outputs/apk/debug/app-debug.apk

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Installation failed!"
    exit 1
fi

echo ""
echo "✅ App installed successfully!"
echo ""
echo "🎉 Opening the app..."
echo ""

# Launch the app
adb shell am start -n com.ovula.app/.ui.auth.SplashActivity

echo ""
echo "✅ App launched!"
echo ""
echo "📱 The Ovula app should now be running on your device!"
echo ""
echo "To view logs:"
echo "  adb logcat | grep Ovula"
echo ""
