# Ovula Android App - Build Instructions

## Quick Start

### 1. Prerequisites
- Android Studio Hedgehog (2023.1.1) or later
- JDK 17
- Android SDK 26 or higher
- Git

### 2. Backend Setup (Required First!)

The mobile app requires the backend server to be running.

```bash
# Navigate to backend directory
cd src/backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Linux/Mac:
source venv/bin/activate
# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend should now be running at `http://localhost:8000`

### 3. Configure Mobile App

#### For Android Emulator:
The default configuration works out of the box:
- `BASE_URL = "http://10.0.2.2:8000/"`

#### For Physical Device:
1. Find your computer's local IP address:
   ```bash
   # On Linux/Mac:
   ifconfig | grep "inet "
   # On Windows:
   ipconfig
   ```

2. Update `app/build.gradle`:
   ```gradle
   buildConfigField("String", "BASE_URL", "\"http://YOUR_LOCAL_IP:8000/\"")
   ```

### 4. Build and Run

#### Option A: Using Android Studio (Recommended)

1. Open Android Studio
2. Click "Open" and select `src/mobile/OvulaApp`
3. Wait for Gradle sync to complete
4. Click the "Run" button (green play icon)
5. Select your emulator or connected device

#### Option B: Using Command Line

```bash
# Navigate to app directory
cd src/mobile/OvulaApp

# Build the app
./gradlew build

# Install on connected device/emulator
./gradlew installDebug

# Or build and install in one command
./gradlew installDebug
```

### 5. First Run

1. The app will open to the splash screen
2. Click "Register" to create a new account
3. Fill in your details (name, email, password)
4. Check your email for OTP code
5. Enter OTP to verify your account
6. Login with your credentials
7. Start using the app!

## Project Structure

```
OvulaApp/
├── app/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/ovula/app/
│   │   │   │   ├── data/           # Data layer
│   │   │   │   │   ├── api/        # Retrofit API service
│   │   │   │   │   ├── model/      # Data models
│   │   │   │   │   └── repository/ # Repositories
│   │   │   │   └── ui/             # UI layer
│   │   │   │       ├── auth/       # Auth screens
│   │   │   │       ├── main/       # Main screens
│   │   │   │       ├── adapter/    # RecyclerView adapters
│   │   │   │       ├── viewmodel/  # ViewModels
│   │   │   │       └── utils/      # Utilities
│   │   │   ├── res/                # Resources
│   │   │   │   ├── layout/         # XML layouts
│   │   │   │   ├── navigation/     # Navigation graph
│   │   │   │   ├── menu/           # Menus
│   │   │   │   └── values/         # Colors, strings
│   │   │   └── AndroidManifest.xml
│   │   └── test/                   # Unit tests
│   └── build.gradle                # App-level Gradle
├── gradle/                         # Gradle wrapper
├── build.gradle                    # Project-level Gradle
└── settings.gradle                 # Gradle settings
```

## Features Implemented

### ✅ Authentication
- User registration
- Email verification with OTP
- Secure login
- JWT token management
- Logout

### ✅ Dashboard
- Cycle progress tracking
- Health statistics
- Quick action cards
- Real-time data

### ✅ Daily Logging
- Period status tracking
- Mood, sleep, weight logging
- Symptom tracking (acne, pain)
- Notes

### ✅ Logs History
- View all logs
- Delete logs
- Date sorting

### ✅ AI Chat
- Chat with AI assistant
- Urdu translation
- Chat history
- Clear history

### ✅ Insights
- Health analytics
- Average metrics
- Cycle analysis
- Recommendations

### ✅ PCOS Prediction
- Risk assessment
- Confidence scores
- Recommendations

### ✅ Diet & Nutrition
- Western recipes
- Desi recipes
- Meal plans
- Nutritional info

### ✅ Profile
- User statistics
- Account management
- Logout

## Troubleshooting

### Issue: "Unable to connect to server"

**Solution:**
1. Verify backend is running: `curl http://localhost:8000/docs`
2. Check BASE_URL in `app/build.gradle`
3. For physical device, ensure both device and computer are on same WiFi
4. Check firewall settings

### Issue: "Build failed"

**Solution:**
```bash
# Clean and rebuild
./gradlew clean
./gradlew build

# Or in Android Studio:
# Build > Clean Project
# Build > Rebuild Project
```

### Issue: "Gradle sync failed"

**Solution:**
1. Check internet connection
2. File > Invalidate Caches / Restart
3. Delete `.gradle` folder and sync again

### Issue: "App crashes on startup"

**Solution:**
1. Check Logcat in Android Studio
2. Verify backend is running
3. Clear app data: Settings > Apps > Ovula > Clear Data
4. Reinstall the app

### Issue: "OTP not received"

**Solution:**
1. Check backend logs for email sending errors
2. Verify email configuration in backend `.env`
3. Check spam folder
4. Try resending OTP

## Development Tips

### Enable Debug Logging

In `RetrofitClient.kt`, the logging interceptor is already configured:
```kotlin
val loggingInterceptor = HttpLoggingInterceptor().apply {
    level = HttpLoggingInterceptor.Level.BODY
}
```

### View Network Requests

Use Android Studio's Network Profiler:
1. Run app in debug mode
2. View > Tool Windows > Profiler
3. Select Network tab

### Debug ViewModels

Add breakpoints in ViewModel functions and use Android Studio debugger.

### Test API Endpoints

Use the backend's Swagger UI:
- Open browser: `http://localhost:8000/docs`
- Test endpoints directly

## Building for Production

### 1. Update Configuration

In `app/build.gradle`:
```gradle
buildTypes {
    release {
        minifyEnabled true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        buildConfigField("String", "BASE_URL", "\"https://your-production-server.com/\"")
    }
}
```

### 2. Generate Signed APK

1. Build > Generate Signed Bundle / APK
2. Select APK
3. Create or select keystore
4. Fill in keystore details
5. Select release build variant
6. Click Finish

### 3. Test Release Build

```bash
./gradlew assembleRelease
```

APK location: `app/build/outputs/apk/release/app-release.apk`

## Performance Optimization

### Already Implemented:
- ViewBinding (no findViewById)
- Coroutines for async operations
- RecyclerView with DiffUtil
- Image loading with Glide
- Efficient layouts

### Future Optimizations:
- Add Room database for offline support
- Implement pagination for logs
- Add image caching
- Optimize network calls

## Testing

### Run Unit Tests
```bash
./gradlew test
```

### Run Instrumented Tests
```bash
./gradlew connectedAndroidTest
```

### Manual Testing Checklist

- [ ] Register new user
- [ ] Verify OTP
- [ ] Login
- [ ] View dashboard
- [ ] Add daily log
- [ ] View logs history
- [ ] Delete log
- [ ] Chat with AI
- [ ] Toggle Urdu translation
- [ ] View insights
- [ ] Generate PCOS prediction
- [ ] Browse recipes
- [ ] View profile
- [ ] Logout

## Additional Resources

- [Android Developer Guide](https://developer.android.com/)
- [Kotlin Documentation](https://kotlinlang.org/docs/home.html)
- [Material Design 3](https://m3.material.io/)
- [Retrofit Documentation](https://square.github.io/retrofit/)
- [Navigation Component](https://developer.android.com/guide/navigation)

## Support

For issues or questions:
1. Check this documentation
2. Review backend logs
3. Check Android Studio Logcat
4. Refer to main project README

## Version Information

- **App Version**: 1.0.0
- **Min SDK**: 26 (Android 8.0)
- **Target SDK**: 35 (Android 15)
- **Compile SDK**: 35
- **Kotlin Version**: 1.9.0
- **Gradle Version**: 8.2.0

## Next Steps After Build

1. Test all features thoroughly
2. Check network connectivity
3. Verify data persistence
4. Test on different devices
5. Monitor performance
6. Collect user feedback

## Known Limitations

- No offline support (requires internet)
- No push notifications yet
- No data export feature
- No calendar view for cycle tracking

These features can be added in future versions.

## Success Indicators

Your build is successful if:
- ✅ App installs without errors
- ✅ Login/registration works
- ✅ Dashboard shows data
- ✅ Can add and view logs
- ✅ Chat responds
- ✅ All screens navigate correctly
- ✅ No crashes in Logcat

Congratulations! Your Ovula Android app is now ready to use! 🎉
