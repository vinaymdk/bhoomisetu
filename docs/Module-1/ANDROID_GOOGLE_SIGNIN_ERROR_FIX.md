# Android Google Sign-In Error: Api10 - Troubleshooting Guide

**Error:** `PlatformException(sign_in_failed,com.google.android.gms.common.api.Api10: ,null, null)`

**Status:** Common Android issue - **FIXABLE**  
**Root Cause:** SHA-1 certificate fingerprint mismatch with Firebase configuration  
**Fix Time:** 10-15 minutes

---

## 🔍 Understanding the Error

The `Api10` error indicates that Google Play Services on your Android device cannot authenticate with Google's servers because:

1. **Certificate Fingerprint Mismatch** (Most Common)
   - Your app's signing certificate SHA-1 doesn't match Firebase console
   - Debug vs Release certificate mismatch
   
2. **Google Play Services Issues**
   - Google Play Services not installed or outdated
   - Device time/date out of sync
   
3. **Firebase Configuration**
   - Android package name mismatch
   - SHA-1 not added to Firebase console
   - Google API key restrictions

---

## ✅ Step-by-Step Fix

### Step 1: Get Your App's SHA-1 Fingerprint

Run this command in your project:

```bash
cd /home/vinaymdk/assistDev/flutter/bhoomisetu

# For debug certificate (development)
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# For release certificate (if you have one)
keytool -list -v -keystore ~/.android/my-release-key.jks -alias my-key-alias
```

**Look for:** The line starting with `SHA1:` and copy that value

Example output:
```
SHA1: AB:CD:EF:01:23:45:67:89:AB:CD:EF:01:23:45:67:89:AB:CD:EF:01
```

### Step 2: Go to Firebase Console

1. Open https://console.firebase.google.com
2. Select project: **bhoomisetu-48706**
3. Click **Settings** (gear icon)
4. Go to **Project Settings**
5. Click **Apps** tab
6. Find your **Android app** (com.bhoomisetu.bhoomisetu_mobile)
7. Click on it

### Step 3: Add SHA-1 Fingerprint to Firebase

1. In the Android app settings, scroll to **SHA certificate fingerprints**
2. Click **Add fingerprint**
3. Paste your SHA-1 from Step 1
4. Click **Save**

**Make sure to add BOTH:**
- ✅ Debug SHA-1 (for development)
- ✅ Release SHA-1 (for production, if you have it)

### Step 4: Download Updated Google Services Config

1. Still in Android app settings
2. Click **Download google-services.json**
3. Save it to: `/home/vinaymdk/assistDev/flutter/bhoomisetu/mobile/android/app/`
4. Make sure it replaces the old file

### Step 5: Verify Android Configuration

Check your `android/app/build.gradle` includes Google Services plugin:

```groovy
// At the top of file
plugins {
    id "com.android.application"
    id "kotlin-android"
    id "dev.flutter.flutter-gradle-plugin"
    id 'com.google.gms.google-services'  // ← Make sure this line exists
}

// At the bottom of file
apply plugin: 'com.google.gms.google-services'  // ← Or this line
```

If missing, add it. Check [mobile/android/app/build.gradle](mobile/android/app/build.gradle)

### Step 6: Check Correct Package Name

Make sure Android package matches Firebase:

**In AndroidManifest.xml:**
```xml
<manifest package="com.bhoomisetu.bhoomisetu_mobile">
```

**In build.gradle (defaultConfig):**
```groovy
applicationId "com.bhoomisetu.bhoomisetu_mobile"
```

**In Firebase Console:** Should show `com.bhoomisetu.bhoomisetu_mobile`

All three must match exactly!

### Step 7: Rebuild and Test

```bash
cd /home/vinaymdk/assistDev/flutter/bhoomisetu/mobile

# Clean build
flutter clean

# Get dependencies
flutter pub get

# Rebuild Android project
flutter build apk --debug

# Or run directly on device
flutter run -v
```

---

## 🐛 Common Issues & Additional Fixes

### Issue A: Multiple SHA-1 Fingerprints Needed

If you have different machines or use CI/CD, add ALL SHA-1s:

```bash
# Get SHA-1 from different machines
# Machine 1
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1

# Machine 2
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1

# Add all of them to Firebase console!
```

### Issue B: Google Play Services Outdated

On the test device, update Google Play Services:

1. Open **Google Play Store**
2. Search for **Google Play Services**
3. Click **Update** if available
4. Wait for update to complete
5. Restart app

### Issue C: Device Date/Time Wrong

Google sign-in requires correct device time:

1. Open device **Settings**
2. Go to **Date & Time**
3. Enable **Automatic date & time**
4. Restart app

### Issue D: Wrong Certificate Used

If you have multiple keystores:

```bash
# List all keystores
ls -la ~/.android/

# Check each one
keytool -list -v -keystore ~/.android/KEYSTORE_NAME -storepass PASSWORD | grep SHA1

# Make sure you're using the one that matches Firebase
```

### Issue E: Android App Not Linked to Firebase

Verify in Firebase Console:

1. Go to Firebase Project
2. **Settings** → **Apps**
3. Do you see your Android app listed?
4. If NOT: Click **Add App** → **Android**
5. Enter package name: `com.bhoomisetu.bhoomisetu_mobile`
6. Download google-services.json
7. Add to project

---

## 📱 Testing the Fix

### Test 1: Verify Firebase Config is Correct

```bash
# Check if google-services.json is in correct location
ls -la mobile/android/app/google-services.json

# Should exist and be readable
# If missing, download it from Firebase console again
```

### Test 2: Check Logcat Output

Run with verbose logging to see what's happening:

```bash
cd mobile

# Clean and rebuild
flutter clean
flutter pub get

# Run with verbose output
flutter run -v 2>&1 | grep -i "google\|firebase\|sha1\|sign"

# Or check Android logs
adb logcat | grep -i "google\|firebase\|sign_in"
```

### Test 3: Manual Test on Device

1. Run app: `flutter run`
2. Navigate to login screen
3. Click **Google** button
4. Check if dialog opens smoothly
5. Select your Google account
6. Watch the logs for errors

### Test 4: Check Certificate Matching

```bash
# Get your debug certificate SHA-1
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android | grep SHA1

# Compare with Firebase console
# They must match EXACTLY (ignore colons if needed)
```

---

## 🔧 Advanced Troubleshooting

### If error persists after adding SHA-1:

```bash
# 1. Clear app cache on device
adb shell pm clear com.bhoomisetu.bhoomisetu_mobile

# 2. Uninstall app
adb uninstall com.bhoomisetu.bhoomisetu_mobile

# 3. Delete Flutter build cache
cd mobile && flutter clean

# 4. Rebuild everything
flutter pub get
flutter run --release  # Try release mode if debug fails

# 5. Check for typos in Firebase settings
# Re-download google-services.json from Firebase console
```

### Check Firebase API Key Configuration

Sometimes the API key needs to be restricted:

1. Go to Firebase Console
2. **Settings** → **APIs & APIs**
3. Look for your **API Key**
4. Edit it and make sure Android apps are allowed
5. Verify package name: `com.bhoomisetu.bhoomisetu_mobile`

---

## 📋 Verification Checklist

Before testing again:

- [ ] SHA-1 fingerprint added to Firebase console
- [ ] google-services.json downloaded and placed in `mobile/android/app/`
- [ ] Android package name matches Firebase: `com.bhoomisetu.bhoomisetu_mobile`
- [ ] build.gradle includes Google Services plugin
- [ ] AndroidManifest.xml has correct package name
- [ ] Flutter cache cleaned: `flutter clean`
- [ ] Dependencies updated: `flutter pub get`
- [ ] Device has latest Google Play Services
- [ ] Device date/time is correct
- [ ] App uninstalled and rebuilt: `flutter run`

---

## 🎯 Expected Result

After following these steps:

✅ **Success:** Google Sign-In dialog opens smoothly  
✅ **User selects account**  
✅ **App authenticates and navigates to home screen**  

If still failing, check the logs for more specific error messages.

---

## 📞 If Error Still Occurs

Check Logcat for specific error:

```bash
adb logcat | grep -E "sign_in|Api10|GoogleSignIn" | tail -20
```

Common log messages:

| Message | Meaning | Fix |
|---------|---------|-----|
| `SHA1 mismatch` | Cert fingerprint wrong | Re-add SHA-1 |
| `Unknown key` | Keystore issue | Check keystore path |
| `API disabled` | Google API not enabled | Enable in Firebase |
| `Package not found` | App not in Firebase | Add Android app to Firebase |
| `Network error` | Device can't reach Google | Check internet |
| `PlayServicesError` | Google Play Services issue | Update GPS on device |

---

## 🔐 Important Security Note

**Never commit google-services.json to git** if it contains sensitive data:

```bash
# Add to .gitignore
echo "mobile/android/app/google-services.json" >> .gitignore

# If already committed, remove it
git rm --cached mobile/android/app/google-services.json
git commit -m "Remove sensitive google-services.json"
```

---

## 📚 Additional Resources

- [Google Sign-In Android Setup](https://developers.google.com/identity/sign-in/android/start-integrating)
- [Firebase Android Setup](https://firebase.google.com/docs/android/setup)
- [SHA-1 Fingerprint Guide](https://developers.google.com/android/guides/client-auth)
- [Android Keystore Management](https://developer.android.com/training/articles/keystore)

---

## ✅ Summary

**The Api10 error is almost always a SHA-1 fingerprint mismatch.**

**Quick Fix:**
1. Get your SHA-1: `keytool -list -v -keystore ~/.android/debug.keystore ...`
2. Add to Firebase console
3. Download updated google-services.json
4. Rebuild: `flutter clean && flutter pub get && flutter run`

**That should fix it!** 

If not, check the Logcat output for the specific error and reference the troubleshooting table above.

---

**Time to fix:** 10-15 minutes  
**Success rate:** 95%+ with SHA-1 fix  
**Difficulty:** Easy
