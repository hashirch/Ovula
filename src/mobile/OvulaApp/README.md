# Ovula Android App

A comprehensive PCOS tracking and management Android application built with Kotlin and modern Android development practices.

## Features

### ✅ Completed Features

- **Authentication**
  - User registration with email verification
  - Secure login with JWT tokens
  - OTP verification
  - Token management with EncryptedSharedPreferences

- **Dashboard**
  - Real-time cycle progress tracking
  - Health statistics overview
  - Quick action cards
  - Dynamic cycle day calculation

- **Daily Logging**
  - Track period status, mood, sleep, weight
  - Record symptoms (acne, pain levels)
  - Add personal notes
  - Date picker for historical entries

- **Logs History**
  - View all past logs
  - Delete logs
  - Empty state handling

- **AI Chat Assistant**
  - Chat with AI for PCOS guidance
  - Urdu translation support
  - Chat history
  - Clear history option

- **Insights & Analytics**
  - Overall health statistics
  - Average mood, sleep, pain tracking
  - Cycle length analysis
  - Personalized recommendations

- **PCOS Prediction**
  - AI-powered risk assessment
  - Health profile management
  - Risk score and confidence levels
  - Personalized recommendations

- **Diet & Nutrition**
  - Western and Desi recipe tabs
  - PCOS-friendly meal plans
  - Recipe details with benefits
  - Calorie and time information

- **Profile**
  - User statistics
  - Account management
  - Logout functionality

## Tech Stack

- **Language**: Kotlin
- **Architecture**: MVVM (Model-View-ViewModel)
- **UI**: Material Design 3, ViewBinding
- **Navigation**: Navigation Component
- **Networking**: Retrofit, OkHttp
- **Async**: Kotlin Coroutines
- **Security**: EncryptedSharedPreferences
- **Image Loading**: Glide
- **Charts**: MPAndroidChart (ready to use)

## Project Structure

```
app/
├── src/main/
│   ├── java/com/ovula/app/
│   │   ├── data/
│   │   │   ├── api/          # API service and Retrofit client
│   │   │   ├── model/        # Data models
│   │   │   └── repository/   # Repository layer
│   │   └── ui/
│   │       ├── auth/         # Authentication screens
│   │       ├── main/         # Main app screens
│   │       ├── adapter/      # RecyclerView adapters
│   │       ├── viewmodel/    # ViewModels
│   │       └── utils/        # Utility classes
│   └── res/
│       ├── layout/           # XML layouts
│       ├── navigation/       # Navigation graph
│       ├── menu/             # Bottom navigation menu
│       └── values/           # Colors, strings, themes
```

## Setup Instructions

### Prerequisites

- Android Studio Hedgehog or later
- JDK 17
- Android SDK 26+
- Backend server running (see backend setup)

### Installation

1. **Clone the repository**
   ```bash
   cd src/mobile/OvulaApp
   ```

2. **Configure Backend URL**
   
   Update the `BASE_URL` in `app/build.gradle`:
   ```gradle
   buildConfigField("String", "BASE_URL", "\"http://YOUR_SERVER_IP:8000/\"")
   ```
   
   For Android Emulator: `http://10.0.2.2:8000/`
   For Physical Device: `http://YOUR_LOCAL_IP:8000/`

3. **Sync Gradle**
   ```bash
   ./gradlew sync
   ```

4. **Build the App**
   ```bash
   ./gradlew build
   ```

5. **Run on Emulator/Device**
   ```bash
   ./gradlew installDebug
   ```

## Backend Setup

Make sure the backend server is running:

```bash
cd src/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

The app connects to the following backend endpoints:

- `/auth/*` - Authentication (register, login, verify OTP)
- `/logs/*` - Daily logs (create, get, stats, delete)
- `/insights/` - Health analytics
- `/chat/*` - AI assistant
- `/speech/tts` - Text-to-speech (ElevenLabs)
- `/prediction/*` - PCOS prediction

## Configuration

### Network Security

For development, the app uses cleartext traffic. For production:

1. Remove `android:usesCleartextTraffic="true"` from `AndroidManifest.xml`
2. Use HTTPS for all API calls
3. Update `BASE_URL` to use HTTPS

### Dependencies

All dependencies are managed in `app/build.gradle`:

```gradle
dependencies {
    // Core
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    
    // Lifecycle & ViewModel
    implementation 'androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0'
    implementation 'androidx.lifecycle:lifecycle-livedata-ktx:2.7.0'
    
    // Navigation
    implementation 'androidx.navigation:navigation-fragment-ktx:2.7.6'
    implementation 'androidx.navigation:navigation-ui-ktx:2.7.6'
    
    // Networking
    implementation 'com.squareup.retrofit2:retrofit:2.9.0'
    implementation 'com.squareup.retrofit2:converter-gson:2.9.0'
    implementation 'com.squareup.okhttp3:logging-interceptor:4.12.0'
    
    // Coroutines
    implementation 'org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3'
    
    // Security
    implementation 'androidx.security:security-crypto:1.1.0-alpha06'
    
    // Charts
    implementation 'com.github.PhilJay:MPAndroidChart:v3.1.0'
    
    // Image Loading
    implementation 'com.github.bumptech.glide:glide:4.16.0'
}
```

## Screens Overview

### 1. Dashboard
- Displays current cycle day
- Shows health statistics
- Quick action cards for navigation
- Real-time data from backend

### 2. Add Log
- Date picker for log entry
- Period status dropdown
- Mood, acne, and pain sliders
- Sleep hours and weight inputs
- Notes field

### 3. Logs History
- RecyclerView of all logs
- Delete functionality
- Sorted by date (newest first)
- Empty state when no logs

### 4. Chat
- AI assistant interface
- Urdu translation toggle
- Chat history
- Clear history option
- Message bubbles (user/AI)

### 5. Insights
- Overall statistics card
- Average metrics (mood, sleep, pain, acne)
- Cycle length tracking
- Personalized recommendations

### 6. PCOS Prediction
- Generate prediction button
- Risk score display
- Confidence level
- Recommendations list

### 7. Diet & Nutrition
- Tab layout (Western/Desi)
- Recipe cards with benefits
- Time and calorie information
- PCOS-friendly meals

### 8. Profile
- User statistics
- Account information
- Logout button

## Development

### Adding New Features

1. **Create Model** in `data/model/Models.kt`
2. **Add API Endpoint** in `data/api/OvulaApiService.kt`
3. **Create Repository** in `data/repository/`
4. **Create ViewModel** in `ui/viewmodel/`
5. **Create Fragment** in `ui/main/`
6. **Create Layout** in `res/layout/`
7. **Add to Navigation** in `res/navigation/main_nav_graph.xml`

### Code Style

- Follow Kotlin coding conventions
- Use ViewBinding for view access
- Implement MVVM architecture
- Use Coroutines for async operations
- Handle loading and error states

## Testing

### Run Unit Tests
```bash
./gradlew test
```

### Run Instrumented Tests
```bash
./gradlew connectedAndroidTest
```

## Build Variants

- **Debug**: Development build with logging
- **Release**: Production build with ProGuard

### Generate Release APK
```bash
./gradlew assembleRelease
```

## Troubleshooting

### Common Issues

1. **Network Error**
   - Check backend server is running
   - Verify BASE_URL is correct
   - Check network permissions in manifest

2. **Build Errors**
   - Clean and rebuild: `./gradlew clean build`
   - Invalidate caches in Android Studio
   - Sync Gradle files

3. **Authentication Issues**
   - Clear app data
   - Check token storage
   - Verify API endpoints

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

This project is part of the Ovula PCOS tracking system.

## Support

For issues and questions, please refer to the main project documentation.

## Changelog

### Version 1.0.0 (Current)
- ✅ Complete authentication flow
- ✅ Dashboard with real-time data
- ✅ Daily logging functionality
- ✅ Logs history with delete
- ✅ AI chat assistant with Urdu support
- ✅ Insights and analytics
- ✅ PCOS prediction
- ✅ Diet & nutrition with recipes
- ✅ User profile and settings
- ✅ Bottom navigation
- ✅ Material Design 3 UI
- ✅ MVVM architecture
- ✅ Repository pattern
- ✅ Error handling
- ✅ Loading states
- ✅ Empty states

## Screenshots

The app includes:
- Modern Material Design 3 UI
- Pink color scheme matching web app
- Smooth animations and transitions
- Responsive layouts
- Empty states for better UX
- Loading indicators
- Error messages

## Next Steps

Optional enhancements:
- Offline support with Room database
- Push notifications
- Calendar view for cycle tracking
- Charts with MPAndroidChart
- Voice input/output
- Export data to PDF
- Reminders
