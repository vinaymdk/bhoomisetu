# Firebase Client Configuration

## Overview

The backend provides Firebase client configuration via `/api/config/firebase` endpoint. This allows frontend apps (Web and Mobile) to get Firebase config without needing their own `.env` files.

## Required Environment Variables

Add these to `backend/.env` for Firebase client SDK:

```env
# Firebase Client SDK Config (for frontend)
FIREBASE_CLIENT_API_KEY=your-firebase-web-api-key
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
FIREBASE_APP_ID=your-firebase-app-id
```

## Getting Firebase Client Config

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project
3. Go to Project Settings (gear icon)
4. Scroll to "Your apps" section
5. Click on Web app (or create one)
6. Copy the config values:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...", // This is FIREBASE_CLIENT_API_KEY
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

## Alternative: Auto-detect from Credentials File

If `FIREBASE_CREDENTIALS_PATH` is set and the file exists, the backend will try to extract `project_id` from it. However, you still need to set `FIREBASE_CLIENT_API_KEY` separately as it's different from the Admin SDK credentials.

## Notes

- `FIREBASE_CLIENT_API_KEY` is different from Admin SDK private key
- Client API key is safe to expose (it's public)
- The `/api/config/firebase` endpoint is public (no authentication required)
- Frontend apps fetch this config on initialization

## Testing

1. Start backend server
2. Visit: `http://localhost:3000/api/config/firebase`
3. Should return Firebase client config JSON
4. Frontend will automatically fetch this on app load
