# Mobile OTP Email Issue - Diagnosis & Fixes

**Date**: January 13, 2026  
**Status**: IN PROGRESS  
**Priority**: HIGH - Blocking Module 1 Authentication (Mobile)

---

## 🔴 Current Issues Summary

### Issue #1: Email OTP Not Sending on Mobile
- **Platform**: Mobile (Flutter) only - Web works fine
- **Symptom**: User requests email OTP, backend returns success, but no email received
- **Root Cause**: Network connectivity issue between mobile app and backend API

### Issue #2: Misleading Firebase Message (Already Fixed in Backend)
- **Platform**: Mobile documentation/old message
- **Message**: "OTP will be sent to your email via Firebase. Use Firebase SDK on client to receive OTP."
- **Root Cause**: This message doesn't appear in current backend code; it's in old documentation
- **Status**: ✅ Backend already uses Brevo SMTP (confirmed in code)

### Issue #3: Connection Refused Error
- **Error**: `DioException [connection error]: The connection errored: Connection refused`
- **Address**: localhost, port 44968 (random port - indicates Dio internal error)
- **Root Cause**: Mobile app cannot reach backend API server at configured IP/port

---

## ✅ What's Already Correct

### Backend Configuration
- ✅ Email service configured for **Brevo SMTP** (not Firebase)
- ✅ SMTP credentials present in `.env` file
- ✅ Email service successfully initialized with Brevo
- ✅ OTP email templates properly designed
- ✅ `auth/otp/request` endpoint returns correct success message

### Backend Evidence
```typescript
// From backend/src/auth/auth.service.ts (line 101)
await this.emailService.sendOtpEmail(dto.destination, otpCode, dto.purpose || 'login');

return {
  success: true,
  message: 'OTP sent to your email address. Please check your inbox.',  // ← Correct message
};
```

### Mobile Code
- ✅ Mobile app correctly calls `/auth/otp/request` endpoint
- ✅ Mobile app correctly implements OTP verification flow
- ✅ Auth provider correctly stores tokens

---

## 🔍 Root Cause Analysis

### Problem 1: Mobile API Connectivity
**File**: `mobile/lib/config/api_config.dart`

**Current Configuration**:
```dart
static const String physicalDeviceIP = '192.168.0.8'; // WiFi IP
```

**Issue**: The IP `192.168.0.8` is hardcoded, but:
- Might not be the actual backend IP running on your machine
- Network setup might have changed
- Physical device may be on different network segment

**Current Status Output** (from logs):
```
Wifi: inet 192.168.0.8
Ethernet: inet 192.168.0.9
```

**Diagnosis**: Backend is running on `192.168.0.9` (Ethernet), but mobile app configured for `192.168.0.8` (WiFi)

### Problem 2: Email Service Dependencies
**File**: `backend/.env` ✅ **VERIFIED**

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=9fc766001@smtp-brevo.com
SMTP_PASS=x************r
MAIL_FROM="bhoomisetu.hmd@gmail.com"
```

**Status**: ✅ All required credentials present

---

## 🛠️ FIX #1: Update Mobile API Configuration

**File**: `mobile/lib/config/api_config.dart`

Change from:
```dart
const String physicalDeviceIP = '192.168.0.8'; // Use WiFi IP
```

To:
```dart
const String physicalDeviceIP = '192.168.0.9'; // Use Ethernet IP where backend runs
```

**Why**: Backend is running on Ethernet (`192.168.0.9`), not WiFi (`192.168.0.8`)

---

## 🛠️ FIX #2: Verify Email Service is Running

**Check**: Confirm Brevo SMTP is working

Run in terminal:
```bash
cd /home/vinaymdk/assistDev/flutter/bhoomisetu/backend
npm run start:dev
```

**Verify in logs**: Should see:
```
[Nest] .... LOG [EmailService] Email transporter initialized with Brevo/SMTP
```

**Test Email Sending**: Use backend endpoint to test:
```bash
curl -X POST http://192.168.0.9:3000/api/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{
    "channel": "email",
    "destination": "vinaymdk@gmail.com",
    "purpose": "login"
  }'
```

Expected response:
```json
{
  "success": true,
  "message": "OTP sent to your email address. Please check your inbox."
}
```

---

## 🛠️ FIX #3: Test Mobile App Connection

After updating `api_config.dart` to use `192.168.0.9`:

1. **Rebuild mobile app**:
```bash
cd /home/vinaymdk/assistDev/flutter/bhoomisetu/mobile
flutter clean
flutter pub get
flutter run
```

2. **Test Email OTP Flow**:
   - Open app
   - Select Email tab
   - Enter: `test@example.com`
   - Click "Send Code"
   - Should receive email within 30 seconds

3. **Check logs** for any errors:
   - Dio connection errors
   - Timeout errors
   - Backend response errors

---

## 📋 Configuration Summary

### Before (Current - BROKEN)
| Component | Status | Details |
|-----------|--------|---------|
| Backend Email Service | ✅ Working | Using Brevo SMTP |
| Backend Running | ✅ Running | Port 3000, Ethernet IP |
| Mobile API Config | ❌ WRONG | Pointing to WiFi IP (192.168.0.8) |
| Email OTP Request | ❌ FAILS | Cannot reach backend at wrong IP |
| Firebase Messages | ✅ Fixed | Backend uses Brevo now |

### After (EXPECTED - FIXED)
| Component | Status | Details |
|-----------|--------|---------|
| Backend Email Service | ✅ Working | Using Brevo SMTP |
| Backend Running | ✅ Running | Port 3000, Ethernet IP (192.168.0.9) |
| Mobile API Config | ✅ CORRECT | Pointing to Ethernet IP (192.168.0.9) |
| Email OTP Request | ✅ WORKS | Mobile can reach backend |
| Email OTP Sending | ✅ WORKS | Backend sends via Brevo |

---

## 🧪 Testing Checklist

After applying fixes:

- [ ] Backend starts without email service errors
- [ ] `curl` test to backend email endpoint succeeds
- [ ] Mobile app rebuilds successfully
- [ ] Mobile app email OTP request shows success message
- [ ] Email received in test email inbox
- [ ] Mobile app can verify OTP code
- [ ] User successfully logs in
- [ ] Token stored in secure storage
- [ ] User data fetched correctly

---

## 📝 No Changes Needed

The following are already correctly configured:

1. **Backend Email Service**: ✅ Uses Brevo SMTP (not Firebase)
2. **Backend Auth Controller**: ✅ Correctly returns success message
3. **Mobile Auth Service**: ✅ Correctly calls OTP endpoints
4. **Mobile Auth Provider**: ✅ Correctly handles tokens

---

## 🎯 Next Steps

1. **Update API config** with correct backend IP
2. **Rebuild and test** mobile app
3. **Verify email delivery** end-to-end
4. **Document** in project wiki for future reference
5. **Add note** about configuring IP based on network

---

## ⚠️ Important Notes

- **IP Configuration**: Backend IP changes based on network setup
  - Use `192.168.0.9` for Ethernet (current setup)
  - Use `192.168.0.8` for WiFi (if switching networks)
  - Run `ifconfig` or `ip addr` to verify actual IPs
  
- **Firebase vs Brevo**: Project uses Brevo for email OTP
  - Firebase is only for social login (Google Sign-In)
  - Email OTP is via Brevo SMTP
  - SMS OTP is simulated (needs SMS gateway integration later)

- **Mobile Device Network**: Physical device must be on same network as backend
  - Both on WiFi: use WiFi IP for backend
  - Both on Ethernet: use Ethernet IP for backend
  - Cannot mix (WiFi device ↔ Ethernet backend)

---

## 📚 Related Files

- Backend Email Service: [backend/src/auth/services/email.service.ts](backend/src/auth/services/email.service.ts)
- Backend Auth Service: [backend/src/auth/auth.service.ts](backend/src/auth/auth.service.ts)
- Mobile Auth Service: [mobile/lib/services/auth_service.dart](mobile/lib/services/auth_service.dart)
- Mobile API Config: [mobile/lib/config/api_config.dart](mobile/lib/config/api_config.dart)
- Backend Environment: [backend/.env](backend/.env)

---

**Status**: Ready for fixes → Testing → Verification
