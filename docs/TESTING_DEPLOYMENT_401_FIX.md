# 401 Authorization Fix - Testing & Deployment Guide

## Overview

The 401 Unauthorized errors across all pages (Home, My-Listings, Properties) and on image upload were caused by a **token refresh mechanism failure**. The backend was returning tokens in an inconsistent format, and clients weren't properly handling token refresh retries.

---

## What Was Fixed

### Backend (`auth.service.ts`)
- ✅ `refreshTokens()` now wraps response in `{ tokens: { accessToken, refreshToken } }` format
- ✅ Consistent with other auth endpoints like `verifyOtp()`
- ✅ Fixed DioException response parsing

### Web Frontend (`api.ts`)
- ✅ Prevents infinite retry loops on `/auth/refresh` endpoint failures
- ✅ Correctly extracts tokens from response: `response.data?.tokens || response.data`
- ✅ Validates accessToken exists before storing
- ✅ Properly redirects to login on refresh failure
- ✅ Early exit if refreshToken is missing

### Mobile Frontend (`api_client.dart`)
- ✅ Uses direct HTTP call instead of AuthService (avoids circular dependency)
- ✅ Proper null safety and type validation
- ✅ Cleans up tokens on refresh failure
- ✅ Properly manages async refresh queue state
- ✅ Sets `_isRefreshing = false` on early exit

---

## Deployment Steps

### Step 1: Backend Update

```bash
cd /home/vinaymdk/assistDev/flutter/bhoomisetu/backend

# Rebuild TypeScript
npm run build

# Verify build succeeded
ls -la dist/auth/auth.service.js

# Restart the backend service
npm start
# or if using systemd:
# sudo systemctl restart bhoomisetu-backend
```

**Verification**: Backend should start without errors and log:
```
✅ .env file loaded from: ...
DB_HOST= ...
API listening on port 3000
```

---

### Step 2: Web Frontend Update

```bash
cd /home/vinaymdk/assistDev/flutter/bhoomisetu/web

# Build with new API client
npm run build

# Check for build errors
# Should show: dist/ folder with assets/

# If running locally:
npm run dev
# or if deployed to server:
# Copy dist/ to your web server directory
```

**Verification**: 
- Web app loads without errors
- Network tab shows requests to `/api/*` endpoints

---

### Step 3: Mobile Frontend Update

```bash
cd /home/vinaymdk/assistDev/flutter/bhoomisetu/mobile

# Clean and rebuild
flutter clean
flutter pub get
flutter run

# or for release build:
flutter build apk
flutter build ios
```

**Verification**:
- App compiles without errors
- App launches successfully
- No "Unauthorized" errors during navigation

---

### Step 4: Clear Client-Side Data

#### Web Browser
```bash
# Option 1: Manual
1. Open DevTools (F12)
2. Go to Application → LocalStorage
3. Delete entries for your app domain
4. Go to Network → Clear all
5. Hard refresh page (Ctrl+Shift+R)

# Option 2: Programmatic
# Run this in browser console:
localStorage.clear();
sessionStorage.clear();
```

#### Mobile App
```bash
# iOS
1. Settings → General → iPhone Storage
2. Find app → Offload app (keeps data)
3. Delete app entirely (clears data)
4. Reinstall from app store

# Android  
1. Settings → Apps
2. Find app → Storage → Clear cache
3. Go back → Uninstall
4. Reinstall from Play Store

# Or via command line:
adb shell pm clear <package.name>
```

---

## Testing Checklist

### Phase 1: Basic Authentication Flow

- [ ] Login with phone OTP
  - Expected: Successfully logs in
  - Token should be stored in localStorage (web) / secure storage (mobile)

- [ ] Logout and login again
  - Expected: Clean login, no errors
  - Old token should be cleared

### Phase 2: Token Refresh Verification

**Web Testing**:
1. Login to web app
2. Open DevTools → Network tab, filter by `XHR`
3. Open DevTools → Application → LocalStorage
4. Note the `accessToken` value
5. Navigate to different pages (Home, My-Listings, Properties, Search)
6. **Expected**:
   - [ ] No 401 errors in network tab
   - [ ] All pages load with content
   - [ ] New `accessToken` is different from original (token refreshed)
   - [ ] No "Unauthorized" error messages

**Mobile Testing**:
1. Login to mobile app
2. Use Charles Proxy or Fiddler to monitor requests
3. Navigate through app (Home, My-Listings, Properties, Search)
4. **Expected**:
   - [ ] No 401 responses
   - [ ] All pages load with content
   - [ ] Authorization header: `Bearer <token>` on all requests
   - [ ] No "Unauthorized" error messages

### Phase 3: Image Upload Test

**Web Image Upload**:
1. Go to Create Listing page
2. Upload 2-3 images
3. **Expected**:
   - [ ] Images upload successfully
   - [ ] No 401 error
   - [ ] Network response shows 200 OK
   - [ ] Images appear in preview with action buttons

**Mobile Image Upload**:
1. Go to Create Listing page
2. Select images from gallery (3+ images)
3. **Expected**:
   - [ ] Images upload successfully
   - [ ] No 401 error
   - [ ] Images visible in preview
   - [ ] Can reorder images (if drag-drop fixed)
   - [ ] Can remove images

### Phase 4: Token Expiration Test

**Setup**: 
- Modify backend `.env`:
  ```bash
  JWT_ACCESS_EXPIRES_IN="1m"  # 1 minute instead of 15 minutes
  ```
- Rebuild backend
- Restart backend service

**Web Test**:
1. Login
2. Wait 2 minutes
3. Navigate to any page
4. **Expected**:
   - [ ] App doesn't show 401 error
   - [ ] Page loads successfully
   - [ ] Token was automatically refreshed
   - [ ] NewAccessToken in localStorage is different from original

**Mobile Test**:
1. Login
2. Wait 2 minutes  
3. Navigate to any screen
4. **Expected**:
   - [ ] No 401 error
   - [ ] Screen loads successfully
   - [ ] Token refreshed automatically

### Phase 5: Concurrent Requests Test

**Web Test**:
1. Login
2. Open DevTools → Network tab
3. Go to Home page (triggers multiple API calls)
4. Simultaneously navigate to My-Listings
5. **Expected**:
   - [ ] All requests succeed
   - [ ] Only ONE refresh token call (not multiple)
   - [ ] No 401 errors

**Mobile Test**:
1. Login
2. Enable network monitor (Fiddler/Charles)
3. Rapidly navigate between screens (Home → My-Listings → Properties → Search)
4. **Expected**:
   - [ ] All screens load
   - [ ] Only ONE refresh token call
   - [ ] All requests authorized

### Phase 6: Refresh Token Expiration Test

**Setup**:
- Modify backend `.env`:
  ```bash
  JWT_REFRESH_EXPIRES_IN="30s"  # Very short for testing
  JWT_ACCESS_EXPIRES_IN="10s"   # Also short
  ```

**Web Test**:
1. Login
2. Wait 40 seconds
3. Try to navigate
4. **Expected**:
   - [ ] Redirected to login page
   - [ ] Error message or clean redirect (not 401)
   - [ ] localStorage cleared of tokens

**Mobile Test**:
1. Login
2. Wait 40 seconds
3. Try to navigate to any screen
4. **Expected**:
   - [ ] Redirected to login screen
   - [ ] Secure storage cleared
   - [ ] Can login again successfully

### Phase 7: Error Scenarios

**Missing Refresh Token**:
1. Login, then manually delete `refreshToken` from storage
2. Trigger a 401 by making request with expired accessToken
3. **Expected**:
   - [ ] Redirected to login (not error loop)
   - [ ] Clear error message

**Invalid Refresh Token**:
1. Modify stored `refreshToken` to invalid value
2. Trigger 401 by requesting with expired accessToken
3. **Expected**:
   - [ ] Redirected to login
   - [ ] Error message shown
   - [ ] Tokens cleared from storage

**Network Error During Refresh**:
1. Turn off network/disconnect WiFi
2. Trigger 401 by requesting with expired token
3. **Expected**:
   - [ ] Error message about network/offline
   - [ ] Not infinite retry loop
   - [ ] User can retry when online

---

## Verification Checklist

After completing all tests, verify:

- [ ] No 401 errors on any page load
- [ ] Image upload works without 401
- [ ] Create Listing save works without 401
- [ ] Search filters work without 401
- [ ] Token refresh happens automatically
- [ ] Concurrent requests handled properly
- [ ] Refresh token expiration handled gracefully
- [ ] No infinite retry loops
- [ ] Clear error messages on auth failure
- [ ] Web and Mobile behave consistently

---

## Rollback Plan (If Needed)

If issues occur, rollback changes:

```bash
# Backend
git checkout backend/src/auth/auth.service.ts
cd backend && npm run build && npm start

# Web
git checkout web/src/config/api.ts
cd web && npm run build

# Mobile  
git checkout mobile/lib/config/api_client.dart
cd mobile && flutter clean && flutter pub get && flutter run
```

---

## Debugging Tips

### Network Error Messages

**Web Browser Console**:
```javascript
// Check for refresh errors
localStorage.getItem('accessToken')      // Should not be undefined
localStorage.getItem('refreshToken')     // Should not be undefined

// Manually test refresh endpoint
fetch('http://192.168.0.108:3000/api/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refreshToken: 'your-token' })
})
.then(r => r.json())
.then(d => console.log(d))
```

**Mobile Logs**:
```bash
# View Flutter logs
flutter logs

# Search for "401" or "Unauthorized"
flutter logs | grep -i "401\|unauthorized"

# Check token storage
# (In app: print(_storage.read(key: 'accessToken')))
```

### Common Issues

| Issue | Cause | Fix |
|-------|-------|-----|
| Still seeing 401 | Old token in browser cache | Clear localStorage + hard refresh |
| Infinite redirects to login | Refresh endpoint returning 401 | Check backend is restarted with new code |
| Token not stored | Response format still wrong | Verify backend build is complete |
| Multiple refresh calls | Race condition not fixed | Ensure mobile uses `_isRefreshing` flag properly |

---

## Monitoring

After deployment, monitor logs for:

```bash
# Backend - Watch for token refresh errors
tail -f logs/backend.log | grep -i "401\|refresh\|unauthorized"

# Web - Check browser console
Open DevTools → Console tab

# Mobile - Monitor Logcat
adb logcat | grep flutter
```

Expected normal behavior:
```
[INFO] User login successful: user_id=123
[DEBUG] Token refresh initiated
[DEBUG] New token issued: exp=...
[INFO] Token refresh successful
[INFO] Original request retried with new token
```

Red flags:
```
[ERROR] Invalid refresh token
[ERROR] Refresh failed: token expired
[WARN] Multiple concurrent refresh attempts  
[ERROR] Missing Authorization header
```

---

## Post-Deployment Validation

Run this checklist 24 hours after deployment:

- [ ] Zero 401 errors in error logs
- [ ] User sessions stable (no forced re-logins)
- [ ] Image upload success rate at 100%
- [ ] API response times normal
- [ ] No spike in login attempts (indicates refresh working)

---

## Questions or Issues?

If testing reveals new issues:

1. **Check Backend Logs**:
   ```bash
   npm start 2>&1 | grep -i "error\|401\|refresh"
   ```

2. **Verify Response Format**:
   ```bash
   curl -X POST http://192.168.0.108:3000/api/auth/refresh \
     -H "Content-Type: application/json" \
     -d '{"refreshToken":"<your-token>"}'
   # Should return: { tokens: { accessToken: "...", refreshToken: "..." } }
   ```

3. **Check Token Storage**:
   - Web: DevTools → Application → LocalStorage
   - Mobile: Debug prints in `_refreshTokenAndRetry` method

4. **Test Interceptor**:
   - Web: Add `console.log()` in interceptor
   - Mobile: Add `print()` statements in interceptor

---

**Status**: Ready for Testing and Deployment
**All Syntax Errors**: ✅ Verified - No errors
**Testing Required**: Yes - Full end-to-end validation needed
