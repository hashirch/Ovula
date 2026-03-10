# ElevenLabs Integration for Urdu TTS

## Overview
This project now uses ElevenLabs API for high-quality Urdu text-to-speech in the AI chat assistant.

## Setup Instructions

### 1. Install Dependencies
```bash
cd src/backend
pip install -r requirements.txt
```

### 2. Configuration
The ElevenLabs API key is already configured in `src/backend/.env`:
```
ELEVENLABS_API_KEY=sk_56d3fe72432b98b12c193149944f70726fd4f6fa02aab8ff
ELEVENLABS_VOICE_ID=pNInz6obpgDQGcFmaJgB
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
```

### 3. Voice Selection
To use a different Urdu voice:
1. Visit https://elevenlabs.io/app/voice-library
2. Find an Urdu voice you like
3. Copy the Voice ID
4. Update `ELEVENLABS_VOICE_ID` in `.env`

### 4. How It Works

#### Backend
- **Service**: `src/backend/app/services/elevenlabs_service.py`
  - Handles TTS conversion using ElevenLabs API
  - Supports custom voice selection
  - Returns audio in MP3 format

- **API Endpoint**: `/speech/tts`
  - POST request with text to convert
  - Returns audio stream
  - Requires authentication

#### Frontend
- **Chat Component**: `src/frontend/src/pages/Chat.js`
  - Automatically detects Urdu text
  - Uses ElevenLabs for Urdu speech
  - Falls back to browser TTS for English
  - "Listen" button on each AI response

### 5. Usage

1. **Enable Urdu Translation**:
   - Toggle the "اردو" checkbox in the chat header
   - AI responses will be translated to Urdu

2. **Listen to Responses**:
   - Click the "Listen" button on any AI response
   - For Urdu text: Uses ElevenLabs high-quality voice
   - For English text: Uses browser's built-in TTS

3. **Stop Speaking**:
   - Click the pulsing speaker icon while audio is playing

### 6. API Endpoints

#### Text-to-Speech
```
POST /speech/tts
Authorization: Bearer <token>

Request Body:
{
  "text": "Text to convert to speech",
  "voice_id": "optional-voice-id"
}

Response: Audio stream (audio/mpeg)
```

#### Get Available Voices
```
GET /speech/voices
Authorization: Bearer <token>

Response:
{
  "voices": [
    {
      "voice_id": "...",
      "name": "...",
      "language": "..."
    }
  ]
}
```

### 7. Features

✅ High-quality Urdu text-to-speech
✅ Automatic language detection
✅ Seamless integration with chat
✅ Fallback to browser TTS for English
✅ Stop/pause functionality
✅ Visual feedback (pulsing icon)

### 8. Troubleshooting

**Issue**: "ElevenLabs API key not configured"
- **Solution**: Check that `.env` file has `ELEVENLABS_API_KEY` set

**Issue**: "Voice ID not configured"
- **Solution**: Set `ELEVENLABS_VOICE_ID` in `.env`

**Issue**: Audio doesn't play
- **Solution**: Check browser console for errors, ensure backend is running

**Issue**: Poor audio quality
- **Solution**: Try a different voice ID from ElevenLabs voice library

### 9. Cost Considerations

ElevenLabs pricing (as of 2024):
- Free tier: 10,000 characters/month
- Starter: $5/month for 30,000 characters
- Creator: $22/month for 100,000 characters

Monitor usage at: https://elevenlabs.io/app/usage

### 10. Future Enhancements

Potential improvements:
- [ ] Add speech-to-text (STT) for voice input
- [ ] Cache frequently used audio responses
- [ ] Add voice selection UI
- [ ] Support multiple languages
- [ ] Add audio playback controls (speed, pause)

## Notes

- ElevenLabs doesn't provide STT (Speech-to-Text) yet
- For STT, consider using:
  - OpenAI Whisper API
  - Google Cloud Speech-to-Text
  - Azure Speech Services
- Current implementation uses browser's Web Speech API for voice input
