# IMMEDIATE ACTION PLAN - Mobile App Testing & Next Steps

**Date**: January 13, 2026  
**Status**: Ready for Testing Phase  
**Lead**: Senior Product Architect

---

## 🎯 NEXT 24 HOURS - Critical Path

### ACTION 1️⃣: Rebuild Mobile App (15 mins)
```bash
# Navigate to mobile directory
cd /home/vinaymdk/assistDev/flutter/bhoomisetu/mobile

# Clean and rebuild
flutter clean
flutter pub get
flutter run

# Expected output:
# ✅ Dependencies updated
# ✅ App builds successfully  
# ✅ App runs on device
```

**If this fails**:
- Check Flutter version: `flutter --version` (should be >= 3.0)
- Check device is connected: `flutter devices`
- Check for build errors in output
- Run: `flutter doctor` to diagnose environment

---

### ACTION 2️⃣: Test Email OTP on Device (10 mins)

#### Step 1: Open App
- Launch the app on your physical device
- You should see the Login screen

#### Step 2: Select Email Tab
- Click on the email/envelope icon
- Should see email input field

#### Step 3: Send OTP
- Enter a test email: `test@example.com` (or your own)
- Click "Send Code" button
- **Expected message**: "OTP sent to your email address. Please check your inbox."
- **If error**: Check troubleshooting section below

#### Step 4: Check Email
- Open email inbox/Gmail
- **Expected sender**: bhoomisetu.hmd@gmail.com
- **Expected subject**: "Bhoomisetu - Your Login Verification Code"
- **Expected content**: 6-digit code displayed prominently
- **Timing**: Should arrive within 30 seconds
- **If not received**: Check spam folder

#### Step 5: Verify Code
- Copy the 6-digit code from email
- Return to app
- Paste code in OTP field
- Click "Verify Code"
- **Expected result**: Login successful → Redirect to home screen

#### Step 6: Confirm Login
- Check if you're logged in
- Should see user profile/home screen
- Token should be stored in secure storage

### Testing Report Template
```
Date: [DATE]
Device: [Device model and OS]
Network: [WiFi/Ethernet IP]

Email Request:
- Email entered: __________
- "Send Code" clicked: [✓ Yes / ✗ No]
- Success message shown: [✓ Yes / ✗ No]

Email Received:
- Email arrived: [✓ Yes / ✗ No]
- Sender correct: [✓ Yes / ✗ No]
- Code visible: [✓ Yes / ✗ No]
- Time to receive: _______ seconds

Code Verification:
- Code entered correctly: [✓ Yes / ✗ No]
- "Verify" clicked: [✓ Yes / ✗ No]
- Login successful: [✓ Yes / ✗ No]

Overall Status: [✓ PASS / ✗ FAIL]
Issues encountered: _________________________
```

---

## 🔧 If Testing FAILS - Troubleshooting

### Error: "Connection refused"
```
Diagnosis:
- Mobile cannot reach backend server
- Wrong IP in config OR backend not running

Solution:
1. Check backend running: ps aux | grep "node.*main.ts"
2. Verify IP: ip addr show | grep "inet 192.168"
3. Verify config: grep "physicalDeviceIP" mobile/lib/config/api_config.dart
4. Should show: 192.168.0.9

If still failing:
- Rebuild mobile app: flutter clean && flutter pub get && flutter run
```

### Error: "Invalid email format"
```
Solution:
- Use valid email: test@example.com (not just "test")
- Or use your own email that you can access
```

### Error: "Email not received"
```
Diagnosis steps:
1. Check backend logs:
   - Backend should show "Email sent successfully"
   - Look for: "[EmailService] Email sent..."

2. Check email spam folder
   - Sometimes Brevo emails go to spam
   - Add sender to contacts to whitelist

3. Check if backend email service has error:
   - Restart backend: cd backend && npm run start:dev
   - Watch logs for errors

4. Test backend directly:
   curl -X POST http://localhost:3000/api/auth/otp/request \
     -H "Content-Type: application/json" \
     -d '{"channel":"email","destination":"YOUR_EMAIL","purpose":"login"}'
   - Should return: {"success":true,"message":"OTP sent..."}
```

### Error: "Invalid or expired OTP"
```
Solutions:
1. Make sure you copied correct code from email
2. Code is 6 digits only (no letters)
3. Code expires after 10 minutes - request new one if needed
4. Each code can only be used once
```

### Error: "Too many OTP requests"
```
Cause: Requested more than 3 times in 60 seconds

Solution:
- Wait 60 seconds
- Then request again
- This is rate limiting to prevent abuse
```

---

## ✅ SUCCESS INDICATORS

### Email OTP Working ✅
- [ ] App rebuilds without errors
- [ ] Backend still running
- [ ] "Send Code" button works
- [ ] Success message appears
- [ ] Email arrives in inbox
- [ ] Code displays in email
- [ ] Code verification succeeds
- [ ] Login successful

### Next Phase Ready ✅
- [ ] Document results
- [ ] Mark issue as RESOLVED
- [ ] Plan Google Sign-In implementation
- [ ] Select SMS provider

---

## 📋 NEXT WEEK - Google Sign-In

Once email OTP is verified working:

### Research Phase (1 day)
1. Review web implementation: [web/src/services/auth.service.ts](web/src/services/auth.service.ts)
2. Check Flutter google_sign_in package: https://pub.dev/packages/google_sign_in
3. Review Firebase documentation for Flutter
4. Identify required packages for pubspec.yaml

### Implementation Phase (2 days)
1. Add packages to pubspec.yaml
2. Initialize Firebase in main.dart
3. Implement Google Sign-In button
4. Add Google Sign-In logic
5. Handle tokens and user data
6. Error handling

### Testing Phase (0.5 days)
1. Test on device
2. Verify login works
3. Verify tokens received
4. Verify user data fetched

### Timeline
```
Mon: Research complete ✓
Tue-Wed: Implementation ✓
Thu: Testing ✓
Fri: Buffer/next task
```

---

## 📞 SUPPORT

### Quick Help

**Backend logs**:
```bash
# Watch backend logs while testing
cd backend
npm run start:dev
# Watch for: "Email sent successfully" messages
```

**Check email service status**:
```bash
curl http://localhost:3000/api/health
# Should show all services healthy
```

**Database check**:
```bash
psql -U postgres -d bhoomisetu_db -c "SELECT COUNT(*) FROM otp_logs;"
# Should show OTP records created
```

---

## 📊 METRICS TO TRACK

After each test, record:
- Time to send OTP: _____ seconds
- Time to receive email: _____ seconds
- Code verification time: _____ seconds
- Total login time: _____ seconds
- Network: WiFi or Ethernet
- Device: [Device model]
- Success rate: ____%

---

## 🎯 SUCCESS DEFINITION

### Email OTP - DONE when:
✅ Mobile app successfully sends OTP request  
✅ Backend receives and processes request  
✅ Brevo sends email successfully  
✅ User receives email within 1 minute  
✅ User verifies OTP code  
✅ User successfully logs in  
✅ Token stored and accessible  

### Google Sign-In - READY to start when:
✅ Email OTP verified working on device  
✅ All documentation current  
✅ Research completed  
✅ Team approval for implementation  

### SMS - DECISION POINT when:
✅ Email OTP + Google verified working  
✅ SMS provider selected (Twilio/AWS/other)  
✅ API credentials obtained  
✅ Timeline estimated  

---

## 📝 DOCUMENTATION TO UPDATE

After testing, update:
1. [MOBILE_OTP_EMAIL_FIX_COMPLETE.md](MOBILE_OTP_EMAIL_FIX_COMPLETE.md) - Add test results
2. [PENDING_WORK_ITEMS_TRACKER.md](PENDING_WORK_ITEMS_TRACKER.md) - Mark as resolved
3. [panding.prompt.md](panding.prompt.md) - Update with status
4. Create Google Sign-In implementation plan

---

## 🚀 LAUNCH CHECKLIST

Before marking complete:
- [ ] Email OTP tested and working
- [ ] Backend logs show no errors
- [ ] Email arrives consistently (5+ tests)
- [ ] Code verification works every time
- [ ] Login tokens persist
- [ ] Documentation updated
- [ ] Issue marked RESOLVED in tracker

---

## 📅 TIMELINE

```
Jan 13 (Today)    : Issues identified & diagnosed ✓
                    API config fixed ✓
                    Documentation created ✓
                    Ready for testing

Jan 13-14 (48h)   : Mobile app testing
                    - Rebuild app
                    - Test email OTP
                    - Document results
                    - Plan next phase

Jan 14-16 (3 days): Google Sign-In implementation
                    - Research & setup
                    - Code integration
                    - Testing on device

Jan 17-19 (3 days): SMS integration planning
                    - Select provider
                    - Get credentials
                    - Estimate effort

Jan 20+           : Optional polish (icons, UI)
```

---

## 📞 KEY CONTACTS & RESOURCES

### Brevo (Email Service)
- Dashboard: https://app.brevo.com
- SMTP Relay: smtp-relay.brevo.com:587
- Issue: Contact Brevo support

### Firebase (Google Sign-In)
- Console: https://console.firebase.google.com/project/bhoomisetu-48706
- Documentation: https://firebase.google.com/docs/auth

### Flutter
- Docs: https://flutter.dev/docs
- Packages: https://pub.dev
- Community: https://github.com/flutter/flutter/discussions

---

## ✨ FINAL NOTES

1. **You've got this!** The hard part (backend setup) is done.
2. **One line of code changed** but it fixes the whole issue.
3. **Testing is straightforward** - just use the app normally.
4. **Documentation is complete** - should answer any questions.
5. **Next phases are clear** - Google Sign-In is well-defined.

**Status**: Ready to proceed with testing  
**Blocker**: None - proceed immediately  
**Expected Outcome**: Email OTP fully functional within 24 hours  

---

**Last Updated**: January 13, 2026 @ 16:00 UTC  
**Next Update**: After mobile device testing  
**Lead**: Senior Product Architect + Full Stack Engineer
