# URGENT: Your SHA-1 Fingerprint & Quick Fix

**Your Debug SHA-1 Fingerprint:**
```
44:0A:22:8D:67:80:AE:0A:39:ED:57:00:F0:E4:57:D5:22:6E:A4:38
```

---

## 🚀 QUICK FIX (5 minutes)

### Step 1: Add SHA-1 to Firebase Console

1. Go to: https://console.firebase.google.com
2. Select project: **bhoomisetu-48706**
3. Click **Settings** (gear icon) → **Project Settings**
4. Click **Apps** tab
5. Click on **Android app** (com.bhoomisetu.bhoomisetu_mobile)
6. Scroll to **SHA certificate fingerprints**
7. Click **Add fingerprint**
8. Paste: `44:0A:22:8D:67:80:AE:0A:39:ED:57:00:F0:E4:57:D5:22:6E:A4:38`
9. Click **Save**

### Step 2: Download Updated Config

1. On the same Android app page
2. Click **Download google-services.json**
3. Replace the old file at:
   ```
   mobile/android/app/google-services.json
   ```

### Step 3: Rebuild & Test

```bash
cd /home/vinaymdk/assistDev/flutter/bhoomisetu/mobile

# Clean build
flutter clean
flutter pub get

# Run on device
flutter run -v
```

### Step 4: Test Google Sign-In

1. Click **Google** button on login screen
2. Should work now! ✅

---

## ✅ Verification

Before testing, verify your firebase setup:

```bash
# Check google-services.json exists
ls -la mobile/android/app/google-services.json

# Check Android package name matches
grep "package" mobile/android/app/src/main/AndroidManifest.xml

# Should show: com.bhoomisetu.bhoomisetu_mobile
```

---

## 🐛 If Still Not Working

Check the logs:

```bash
flutter run -v 2>&1 | grep -i "sign_in\|google\|firebase"
```

Or:

```bash
adb logcat | grep -E "sign_in|Api10|GoogleSignIn" | tail -20
```

Look for error messages that explain what's wrong.

---

## 📞 Still Having Issues?

See the full guide: [ANDROID_GOOGLE_SIGNIN_ERROR_FIX.md](ANDROID_GOOGLE_SIGNIN_ERROR_FIX.md)

---

**Most Common Fix:** Adding SHA-1 to Firebase (95% success rate)  
**Time to fix:** 5 minutes  
**Difficulty:** Very Easy

Try it now! Let me know if it works. 🚀
