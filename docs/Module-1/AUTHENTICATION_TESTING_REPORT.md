# Authentication Testing Report
**Date:** January 13, 2026  
**Issues Found:** Email OTP 400 Error & Google Sign-In Firebase Initialization Error

---

## 🔴 Issue 1: Email OTP - 400 Bad Request Error

### Error Details
- **Error Type:** `DioException [bad response]`
- **HTTP Status:** 400 (Bad Request)
- **OTP Value:** 941000
- **Message:** "Client error - the request contains bad syntax or cannot be fulfilled"

### Analysis

**Request Format (from code):**
```dart
{
  'channel': 'email',
  'destination': 'vinaymdk@gmail.com',
  'otp': '941000'
}
```

**Backend Validation (VerifyOtpDto):**
- For email OTP: Requires `channel`, `otp`, and `destination`
- Validation: `@ValidateIf((o) => o.channel === 'email' && !o.idToken)`

**Possible Causes:**
1. ✅ **Request format is correct** (matches DTO requirements)
2. ⚠️ **OTP expired** - OTP might have expired (default 10 minutes)
3. ⚠️ **OTP already used** - OTP was already verified
4. ⚠️ **OTP mismatch** - Entered OTP doesn't match sent OTP
5. ⚠️ **Email mismatch** - Destination email doesn't match the one used to request OTP
6. ⚠️ **Backend validation error** - DTO validation might be failing

### Expected Backend Response (from code):
- **Success:** Returns `AuthResult` with user, roles, and tokens
- **Error (400):** 
  - "Invalid or expired OTP. Please request a new code."
  - "Invalid OTP code. Please try again."
  - "Email destination is required for email OTP verification"

### Recommendations:
1. ✅ **Check backend logs** for detailed error message
2. ✅ **Request new OTP** if current one expired or used
3. ✅ **Verify email matches** the one used to request OTP
4. ✅ **Check OTP code** matches the one received in email

---

## 🔴 Issue 2: Google Sign-In - Firebase Not Initialized Error

### Error Details
- **Error:** "Google sign-in failed: Firebase is not initialized. Please ensure Firebase.initializeApp() is called first."
- **Location:** `mobile/lib/services/social_auth_service.dart:16`

### Analysis

**Firebase Initialization Flow:**
1. `main.dart` calls `FirebaseConfig.initialize()` on app start
2. `FirebaseConfig.initialize()` tries to fetch config from backend
3. If successful, calls `Firebase.initializeApp(options)`
4. Sets `_initialized = true` on success
5. Sets `_initialized = false` on error (but doesn't rethrow)

**Current Code Issues:**

```dart
// firebase_config.dart:46-62
static Future<void> initialize() async {
  try {
    if (Firebase.apps.isNotEmpty) {
      _initialized = true;
      return;
    }
    final options = await getConfig();  // This might fail
    await Firebase.initializeApp(options: options);
    _initialized = true;
  } catch (e) {
    _initialized = false;
    // ERROR IS SWALLOWED - Only logs in debug mode
    if (kDebugMode) {
      debugPrint('Firebase initialization failed (optional): $e');
    }
  }
}

static bool get isInitialized => _initialized && Firebase.apps.isNotEmpty;
```

**Problem:**
- Firebase initialization fails silently
- Error is only logged in debug mode
- `isInitialized` returns false, blocking Google Sign-In
- User sees generic error, not the actual failure reason

**Possible Failure Points:**
1. ⚠️ **Backend not running** - Can't fetch Firebase config
2. ⚠️ **Network error** - Connection timeout or refused
3. ⚠️ **Invalid Firebase config** - Missing or invalid API key/app ID
4. ⚠️ **Firebase SDK error** - Invalid configuration format
5. ⚠️ **URL construction issue** - Firebase config endpoint URL might be wrong

**Firebase Config URL Construction:**
```dart
// firebase_config.dart:19
final configUrl = '${ApiConfig.baseUrl}/config/firebase';
// ApiConfig.baseUrl = 'http://10.0.2.2:3000/api'
// Final URL: 'http://10.0.2.2:3000/api/config/firebase'
```

**Backend Endpoint:**
- Controller: `@Controller('config')` → `/config`
- Method: `@Get('firebase')` → `/config/firebase`
- Global prefix: `api` → `/api/config/firebase`
- ✅ **URL is correct!**

**Backend Test Result:**
```bash
$ curl http://localhost:3000/api/config/firebase
# Returns valid Firebase config JSON
```

### Root Cause:
Firebase initialization is failing, but the error is being swallowed. Need to:
1. Add better error logging/display
2. Check if backend is running
3. Verify network connectivity
4. Test Firebase config endpoint accessibility

### Recommendations:
1. ✅ **Check backend is running:** `cd backend && npm run start:dev`
2. ✅ **Check backend logs** for Firebase config requests
3. ✅ **Test Firebase config endpoint** from mobile device/emulator
4. ✅ **Add error logging** to see actual Firebase initialization error
5. ✅ **Display user-friendly error** when Firebase initialization fails

---

## 📋 Testing Checklist

### Email OTP Testing
- [ ] Backend is running and accessible
- [ ] Email OTP request succeeds (check email for OTP)
- [ ] OTP code matches the one in email
- [ ] OTP is entered within expiration time (10 minutes)
- [ ] Email address matches the one used for OTP request
- [ ] Check backend logs for detailed error message
- [ ] Try requesting new OTP if current one fails

### Google Sign-In Testing
- [ ] Backend is running and accessible
- [ ] Firebase config endpoint is accessible: `http://10.0.2.2:3000/api/config/firebase`
- [ ] Firebase config returns valid JSON with all required fields
- [ ] Network connectivity is working (can reach backend)
- [ ] Check Flutter logs for Firebase initialization errors
- [ ] Verify Firebase project is properly configured
- [ ] Test Firebase initialization separately

---

## 🔧 Suggested Fixes

### Fix 1: Improve Firebase Initialization Error Handling

**File:** `mobile/lib/config/firebase_config.dart`

```dart
static Future<void> initialize() async {
  try {
    if (Firebase.apps.isNotEmpty) {
      _initialized = true;
      return;
    }
    final options = await getConfig();
    await Firebase.initializeApp(options: options);
    _initialized = true;
  } catch (e) {
    _initialized = false;
    // Log error with more details
    if (kDebugMode) {
      debugPrint('❌ Firebase initialization failed: $e');
      debugPrint('Stack trace: ${StackTrace.current}');
    }
    // Store error for later retrieval
    _lastError = e.toString();
    // Don't rethrow - Firebase is optional (only needed for social login)
  }
}

static String? _lastError;
static String? get lastError => _lastError;
```

### Fix 2: Better Error Messages in Social Auth

**File:** `mobile/lib/services/social_auth_service.dart`

```dart
Future<String> signInWithGoogle() async {
  try {
    if (!FirebaseConfig.isInitialized) {
      final error = FirebaseConfig.lastError ?? 'Unknown error';
      throw Exception('Firebase is not initialized. Error: $error. Please ensure backend is running and Firebase is properly configured.');
    }
    // ... rest of the code
  } catch (e) {
    // ... error handling
  }
}
```

### Fix 3: Add Firebase Config URL Validation

**File:** `mobile/lib/config/firebase_config.dart`

```dart
static Future<FirebaseOptions> getConfig() async {
  // ... existing code ...
  
  try {
    final configUrl = '${ApiConfig.baseUrl}/config/firebase';
    
    if (kDebugMode) {
      debugPrint('🔍 Fetching Firebase config from: $configUrl');
    }
    
    final response = await http.get(
      Uri.parse(configUrl),
    ).timeout(const Duration(seconds: 10)); // Increased timeout
    
    if (response.statusCode == 200) {
      final config = json.decode(response.body) as Map<String, dynamic>;
      
      // Validate required fields
      if (config['apiKey'] == null || config['apiKey'].toString().isEmpty) {
        throw Exception('Firebase API key is missing in config response');
      }
      
      // ... rest of the code
    } else {
      throw Exception('Failed to fetch Firebase config: HTTP ${response.statusCode}');
    }
  } catch (e) {
    if (kDebugMode) {
      debugPrint('❌ Firebase config fetch failed: $e');
    }
    rethrow; // Let caller handle the error
  }
}
```

---

## 📊 Test Results Summary

### Email OTP Flow
- ✅ **Request Format:** Correct
- ⚠️ **Backend Response:** 400 Bad Request (needs investigation)
- ✅ **Code Structure:** Correct
- ⚠️ **Possible Issues:** OTP expired, mismatch, or backend validation error

### Google Sign-In Flow
- ✅ **Code Structure:** Correct
- ⚠️ **Firebase Initialization:** Failing silently
- ✅ **Backend Endpoint:** Working (tested with curl)
- ⚠️ **Error Handling:** Needs improvement
- ⚠️ **User Feedback:** Generic error message

---

## 🎯 Next Steps

1. **Immediate Actions:**
   - Check backend logs for detailed error messages
   - Verify backend is running: `cd backend && npm run start:dev`
   - Check Flutter/Dart logs for Firebase initialization errors
   - Test Firebase config endpoint from mobile device

2. **Code Improvements:**
   - Add better error logging for Firebase initialization
   - Display user-friendly error messages
   - Add Firebase initialization status indicator
   - Improve error handling in social auth service

3. **Testing:**
   - Test Email OTP with fresh OTP code
   - Test Firebase config endpoint accessibility
   - Verify network connectivity
   - Test Google Sign-In after fixing Firebase initialization

---

**Report Generated:** January 13, 2026  
**Status:** Issues identified, fixes suggested
