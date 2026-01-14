# Google Sign-In - Quick Start Guide

**Get Google Sign-In working in 10 minutes!**

## ⚡ Super Quick Start

### 1. Check Backend IP (1 minute)
```bash
# Find your current backend machine IP
ip addr show | grep "inet " | grep -v 127.0.0.1

# Look for: 192.168.0.x or 192.168.1.x
# Example: inet 192.168.0.8/24
```

### 2. Update Mobile App (2 minutes)
```bash
# Edit this file:
nano /home/vinaymdk/assistDev/flutter/bhoomisetu/mobile/lib/config/api_config.dart

# Find line 60 and update IP:
# Old: const String physicalDeviceIP = '192.168.0.8';
# New: const String physicalDeviceIP = 'YOUR_IP_HERE';
```

### 3. Start Backend (2 minutes)
```bash
cd /home/vinaymdk/assistDev/flutter/bhoomisetu/backend
npm run start:dev

# Wait for: "Bhoomisetu API server running on port 3000"
```

### 4. Run Mobile App (3 minutes)
```bash
cd /home/vinaymdk/assistDev/flutter/bhoomisetu/mobile
flutter clean
flutter pub get
flutter run

# Wait for app to load
```

### 5. Test Google Sign-In (2 minutes)
1. Click **Google** button
2. Select your Google account
3. Should go to Home screen ✅

---

## 🔍 Verify Everything Works

### Quick Verification Checklist
```bash
# 1. Backend running?
curl http://192.168.0.8:3000/api/config/firebase | head -5

# Expected: JSON with projectId, apiKey, etc.

# 2. Mobile IP correct?
grep physicalDeviceIP /home/vinaymdk/assistDev/flutter/bhoomisetu/mobile/lib/config/api_config.dart

# Expected: Shows your backend IP

# 3. Google button visible?
# Look for "Or continue with" section in app
```

---

## 🎯 Expected Results

### ✅ Success (App goes to Home screen)
- Tokens automatically stored
- Can re-open app and stay logged in
- Backend logs show successful token verification

### ❌ Common Issues & Fixes

**"Firebase is not initialized"**
```bash
# Backend might not be running
cd backend && npm run start:dev
```

**"Connection refused" to 192.168.x.x**
```bash
# IP might be wrong, find correct one:
ip addr show | grep "inet " | grep -v 127.0.0.1
# Update in mobile/lib/config/api_config.dart line 60
```

**Google button not visible**
```bash
# Scroll down on login screen - should be below "Send OTP" button
```

---

## 📊 What's Already Done

✅ Firebase packages installed  
✅ Firebase initialization code  
✅ Google Sign-In service  
✅ UI button and flow  
✅ Backend endpoint  
✅ Token generation  
✅ Secure storage  

**Everything is ready - just run it!**

---

## 🚀 Next Steps After Testing

1. **If it works:** 
   - Test on physical Android device
   - Test on iOS device (if available)
   - Document any issues

2. **If it doesn't work:**
   - Check backend IP is correct
   - Verify backend logs: `cd backend && npm run start:dev`
   - Check mobile logs: `flutter logs`
   - See troubleshooting guide in main docs

3. **After successful testing:**
   - Update home screen (currently "Coming Soon")
   - Add user profile display
   - Test token refresh
   - Plan SMS gateway integration

---

## 📞 Command Reference

```bash
# Start backend
cd /home/vinaymdk/assistDev/flutter/bhoomisetu/backend && npm run start:dev

# Run mobile
cd /home/vinaymdk/assistDev/flutter/bhoomisetu/mobile && flutter run

# View logs
flutter logs

# Stop app
Ctrl+C (in flutter run terminal)

# Check if port 3000 is open
lsof -i :3000

# Test backend endpoint
curl http://192.168.0.8:3000/api/config/firebase | jq .

# Find your IP
ip addr show | grep "inet " | grep -v 127.0.0.1

# Kill backend process
pkill -f "npm run start:dev"

# Check backend health
curl http://192.168.0.8:3000/health
```

---

## ⏱️ Time Estimate

| Task | Time |
|------|------|
| Update IP | 2 min |
| Start backend | 2 min |
| Rebuild app | 3 min |
| Run on device | 2 min |
| Test flow | 2 min |
| **Total** | **~10 min** |

---

## 🎉 Summary

**Google Sign-In is FULLY IMPLEMENTED.**

Everything is ready to test. Just:
1. Update backend IP if needed
2. Start backend
3. Run mobile app
4. Click Google button
5. Enjoy! 🚀

Any issues? Check the full guides:
- [GOOGLE_SIGNIN_IMPLEMENTATION_GUIDE.md](GOOGLE_SIGNIN_IMPLEMENTATION_GUIDE.md)
- [GOOGLE_SIGNIN_TESTING_REPORT.md](GOOGLE_SIGNIN_TESTING_REPORT.md)
