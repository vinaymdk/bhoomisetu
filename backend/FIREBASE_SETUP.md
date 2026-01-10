# Firebase Admin SDK Setup

## Overview
This backend uses Firebase Admin SDK for:
- OTP verification (phone/email)
- Social login authentication (Google, Facebook, Apple)
- User management

## Credentials Configuration

### Option 1: Credentials File (Development)
1. Place your Firebase service account JSON file in the backend root directory:
   ```
   backend/bhoomisetu-48706-firebase-adminsdk-*.json
   ```
2. The Firebase service will automatically detect and load it.

### Option 2: Environment Variables (Production/Containerized)
Set the following environment variables:
```bash
FIREBASE_PROJECT_ID=bhoomisetu-48706
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@bhoomisetu-48706.iam.gserviceaccount.com
```

### Option 3: Credentials File Path (Production)
Set the path to your credentials file:
```bash
FIREBASE_CREDENTIALS_PATH=/path/to/firebase-credentials.json
```

## Security Notes

⚠️ **IMPORTANT**: Never commit Firebase credentials to version control!

- The `.gitignore` file excludes `*-firebase-adminsdk-*.json` files
- For production, use environment variables or a secure secrets management service (AWS Secrets Manager, Google Secret Manager, etc.)
- Restrict access to Firebase service account credentials to authorized personnel only

## Installation

Firebase Admin SDK is already included in `package.json`. Install dependencies:
```bash
npm install
```

## Usage in Code

The `FirebaseService` is globally available (imported in `FirebaseModule`):

```typescript
import { FirebaseService } from './firebase/firebase.service';

// Verify ID token (from client after OTP/social login)
const firebaseUser = await this.firebaseService.verifyIdToken(idToken);
// Returns: { uid, email, phoneNumber, displayName, emailVerified, phoneNumberVerified }

// Get user by UID
const user = await this.firebaseService.getUserByUid(uid);

// Create custom token (if needed)
const customToken = await this.firebaseService.createCustomToken(uid);
```

## Authentication Flow

### Phone/Email OTP Flow
1. Client uses Firebase SDK to send OTP: `firebase.auth().signInWithPhoneNumber()`
2. Client verifies OTP using Firebase SDK
3. Client gets Firebase ID token from Firebase
4. Client sends ID token to backend: `POST /api/auth/otp/verify`
5. Backend verifies ID token using Firebase Admin SDK
6. Backend creates/finds user and issues JWT tokens

### Social Login Flow
1. Client authenticates with provider (Google/Facebook/Apple) using Firebase SDK
2. Client gets Firebase ID token
3. Client sends ID token to backend: `POST /api/auth/social`
4. Backend verifies ID token using Firebase Admin SDK
5. Backend creates/finds user and issues JWT tokens

## Testing

To test Firebase integration locally:
1. Ensure Firebase project is configured in Firebase Console
2. Enable Phone Authentication and Social Providers in Firebase Console
3. Place credentials file in backend root (or set environment variables)
4. Run the backend: `npm run start:dev`
5. Test endpoints using Postman or curl with valid Firebase ID tokens

## Troubleshooting

**Error: Firebase credentials not found**
- Ensure credentials file exists or environment variables are set
- Check file permissions (should be readable by the application)

**Error: Invalid Firebase token**
- Token may have expired (tokens expire after 1 hour by default)
- Token may not be from the correct Firebase project
- Check Firebase project configuration in Firebase Console

**Error: Phone number verification failed**
- Ensure Phone Authentication is enabled in Firebase Console
- Verify phone number format matches Firebase requirements
- Check quota limits in Firebase Console
