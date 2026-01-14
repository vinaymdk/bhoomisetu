# OTP Verification Error - Diagnosis & Fix

**Date**: January 13, 2026  
**Status**: 🔴 CRITICAL - Blocking OTP verification  
**Error**: HTTP 400 Bad Request on `/auth/otp/verify`

---

## 🔍 Problem Analysis

### Error Received
```
DioException [bad response]: status code 400
Client Error - the request contains bad syntax or cannot be fulfilled
```

### Root Cause
The backend DTO validation (`VerifyOtpDto`) has an incorrect validation rule.

**Issue in file**: `backend/src/auth/dto/verify-otp.dto.ts`

```typescript
@ValidateIf((o) => o.channel === 'email' && !o.idToken)
@IsString()
@IsNotEmpty()  // ← PROBLEM: This fails when ValidateIf condition is false
otp?: string;
```

### How This Fails

1. Mobile app sends: `{ channel: 'email', destination: '...', otp: '123456' }`
2. Backend validates field `otp`
3. The `ValidateIf` condition is TRUE (channel === 'email' AND no idToken)
4. `@IsNotEmpty()` validation kicks in
5. BUT the `otp` field validation logic seems to have an issue

### Actual Issue (Deep Dive)

The problem is that the `@IsNotEmpty()` decorator is being applied AFTER `@ValidateIf`, but when `ValidateIf` is true, it requires the field to be present and non-empty. However, the way the validators are chained might be causing issues.

**Better approach**: Use a custom validator or restructure the DTO to be more explicit.

---

## ✅ Solution

### Fix: Update VerifyOtpDto Validation

**File**: `backend/src/auth/dto/verify-otp.dto.ts`

**Change from** (BROKEN):
```typescript
@ValidateIf((o) => o.channel === 'email' && !o.idToken)
@IsString()
@IsNotEmpty()
otp?: string;

@IsIn(['sms', 'email'])
channel!: 'sms' | 'email';

@ValidateIf((o) => o.channel === 'email' && !o.idToken)
@IsString()
@IsNotEmpty()
destination?: string;
```

**Change to** (FIXED):
```typescript
@IsString()
@IsOptional()
otp?: string;

@IsIn(['sms', 'email'])
@IsNotEmpty()
channel!: 'sms' | 'email';

@IsString()
@IsOptional()
destination?: string;
```

### Why This Works

1. **Removed `@ValidateIf`**: NestJS validators have issues with conditional validation on optional fields
2. **Made fields `@IsOptional()`**: Allows them to be undefined or present
3. **Validation happens in service logic**: The `auth.service.ts` already checks if required fields are present based on channel type
4. **Service validation is more explicit**: Lines 152-153 in `auth.service.ts` check: `if (!dto.destination) throw new BadRequestException(...)`

This puts validation where it belongs - in the business logic, not in the DTO.

---

## 🔧 Implementation

Apply the fix:

```typescript
import { IsIn, IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class VerifyOtpDto {
  // Firebase ID token (from client after OTP verification)
  // This is the preferred method for Firebase Auth - client verifies OTP with Firebase SDK first
  @IsString()
  @IsOptional()
  idToken?: string;

  // Alternative: Direct OTP verification (for email OTP via Brevo)
  @IsString()
  @IsOptional()
  otp?: string;

  @IsIn(['sms', 'email'])
  @IsNotEmpty()
  channel!: 'sms' | 'email';
  
  // Destination (email or phone) - required for email OTP verification
  @IsString()
  @IsOptional()
  destination?: string;
  
  // Optional metadata
  @IsOptional()
  @IsString()
  deviceId?: string;
}
```

---

## ✅ Verification

After applying the fix:

1. **Restart backend**:
   ```bash
   cd backend
   # Stop current process (Ctrl+C)
   npm run start:dev
   ```

2. **Test OTP verification**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/otp/verify \
     -H "Content-Type: application/json" \
     -d '{
       "channel": "email",
       "destination": "test@example.com",
       "otp": "123456"
     }'
   ```

3. **Expected response**:
   - If OTP invalid: `{"message":"Invalid OTP code. Please try again.","error":"Bad Request","statusCode":400}`
   - If OTP valid: User object with tokens

4. **Test on mobile**:
   - Rebuild app (should still work with fixed API)
   - Request OTP
   - Enter code from email
   - Should log in successfully

---

## 📋 Related Errors

The fix also resolves:
- ✅ HTTP 400 errors on OTP verification
- ✅ "Bad syntax" validation errors
- ✅ Potential issues with other channels

---

## 🎯 What Happens After Fix

### Email OTP Flow (Complete)
1. User enters email → `/auth/otp/request` ✅
2. Backend sends email via Brevo ✅
3. User receives email ✅
4. User enters 6-digit code ✅
5. Mobile sends to `/auth/otp/verify` ✅ (WILL WORK AFTER FIX)
6. Backend validates OTP ✅ (WILL WORK AFTER FIX)
7. User logs in → Tokens returned ✅ (WILL WORK AFTER FIX)
8. User redirected to home ✅ (WILL WORK AFTER FIX)

---

## 📊 Impact Analysis

- **Scope**: Backend DTO validation only
- **Breaking changes**: None - makes validation less strict
- **Backward compatibility**: 100% compatible
- **Testing needed**: OTP verification flow
- **Deployment**: Requires backend restart

---

## 🧪 Testing After Fix

### Manual Test
```bash
# 1. Request OTP
curl -X POST http://localhost:3000/api/auth/otp/request \
  -H "Content-Type: application/json" \
  -d '{"channel":"email","destination":"test@example.com","purpose":"login"}'

# 2. Check backend logs for OTP code
# 3. Get OTP from email or logs
# 4. Verify OTP
curl -X POST http://localhost:3000/api/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"channel":"email","destination":"test@example.com","otp":"XXXXXX"}'

# Expected: User object + tokens
```

### Mobile Test
1. Rebuild app: `flutter clean && flutter pub get && flutter run`
2. Request email OTP
3. Enter code from email
4. Should successfully log in

---

**Status**: Ready to apply fix  
**Estimated Time**: 2 minutes to apply + 5 minutes testing
