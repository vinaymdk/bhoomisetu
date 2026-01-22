# Token Refresh Flow Diagram - Before & After Fix

## Understanding the 401 Unauthorized Issue

### Authentication Token Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│ USER LOGIN                                                  │
│ ────────────────────────────────────────────────────────    │
│                                                             │
│  1. POST /auth/otp/request (phone number)                 │
│  2. Receive OTP via SMS                                    │
│  3. POST /auth/otp/verify (phone + OTP)                   │
│  4. Response: { tokens: {                                  │
│       accessToken: "jwt_token_15min",                      │
│       refreshToken: "jwt_token_7days"                      │
│     }}                                                      │
│  5. Store both tokens securely                             │
│                                                             │
│  ✅ accessToken: Used for API requests (15 minutes valid)  │
│  ✅ refreshToken: Used to get new accessToken (7 days)     │
└─────────────────────────────────────────────────────────────┘
```

---

## BEFORE FIX ❌ - Token Refresh Fails

```
Timeline: User logged in, making requests...

0 min:
  ┌──────────────────────┐
  │ accessToken: VALID   │
  │ refreshToken: VALID  │
  └──────────────────────┘
  
  User navigates Home → My-Listings
  ✅ Request succeeds (token valid)
  ✅ Page loads with content

15 min:
  ┌──────────────────────┐
  │ accessToken: EXPIRED │
  │ refreshToken: VALID  │
  └──────────────────────┘
  
  User navigates Properties
  ❌ GET /properties returns 401 Unauthorized
  
  Interceptor triggers token refresh:
  1. Read refreshToken from storage ✅
  2. POST /auth/refresh {refreshToken: "..."} ✅
  3. Backend returns response:
     
     {"tokens": {"accessToken": "...", "refreshToken": "..."}}
              ↑ This wrapper is MISSING
     
  4. Web client tries to access:
     response.data.tokens.accessToken
     
     But the OLD code returned:
     {"accessToken": "...", "refreshToken": "..."}
              ↑ No "tokens" wrapper
  
  5. Parsing FAILS ❌
     Cannot find response.data.tokens.accessToken
  6. New token NOT stored ❌
  7. Original request NOT retried ❌
  8. User sees: "Unauthorized" error
  
  10 seconds later, user tries again:
  ❌ Same error repeats (tokens still expired)
  ❌ User must re-login manually
```

### Mobile Specific Issues Before Fix

```
Mobile Token Refresh Problem - CIRCULAR DEPENDENCY:

Interceptor catches 401
  ↓
_refreshTokenAndRetry() called
  ↓
Create AuthService() instance
  ↓
  ❌ PROBLEM: AuthService needs initialized ApiClient
  ↓ 
  ❌ ApiClient has interceptor
  ↓
  ❌ Interceptor calls _refreshTokenAndRetry()
  ↓
  ❌ CIRCULAR DEPENDENCY → Crash or timeout
```

---

## AFTER FIX ✅ - Token Refresh Works

```
Timeline: Same scenario with fix...

15 min:
  ┌──────────────────────┐
  │ accessToken: EXPIRED │
  │ refreshToken: VALID  │
  └──────────────────────┘
  
  User navigates Properties
  ❌ GET /properties returns 401 Unauthorized
  
  Interceptor triggers token refresh:
  1. Check if URL is /auth/refresh
     → No, it's /properties
     → Continue to refresh ✅
  
  2. Read refreshToken from storage ✅
  
  3. POST /auth/refresh {refreshToken: "..."}
     
     Wait... prevent infinite loop!
     if (url.includes('/auth/refresh')) {
       // Don't retry the refresh endpoint itself
       logout();
     } ✅
  
  4. Backend returns:
     {"tokens": {"accessToken": "...", "refreshToken": "..."}}
  
  5. Client extracts tokens:
     const tokens = response.data?.tokens || response.data;
     const { accessToken, refreshToken } = tokens;
     
     ✅ Works with both formats!
  
  6. Validate accessToken exists:
     if (!accessToken) throw Error;
     ✅ Fail fast if response invalid
  
  7. Store new tokens in localStorage
     localStorage.setItem('accessToken', accessToken);
     ✅ Tokens updated
  
  8. Retry original request:
     originalRequest.headers.Authorization = 
       `Bearer ${accessToken}`;
     return apiClient(originalRequest);
     ✅ Request retried with new token
  
  9. GET /properties returns 200 OK
     ✅ Page loads with content
     
  10. User continues browsing
      ✅ No interruption
```

### Mobile Fix - Direct HTTP Call

```
Mobile Token Refresh Fix:

Before - Circular Dependency ❌
Interceptor catches 401
  ↓
Call _refreshTokenAndRetry()
  ↓
Create AuthService()
  ↓
❌ Circular dependency issues

After - Direct HTTP Call ✅
Interceptor catches 401
  ↓
Call _refreshTokenAndRetry()
  ↓
_dio.post('/auth/refresh', data: {...})
  ↓
✅ Direct HTTP call (bypasses AuthService)
  ↓
Parse response and update tokens
  ↓
✅ Retry original request
```

---

## Multiple Concurrent Requests Scenario

### Before Fix ❌ - Multiple Refresh Attempts

```
t=0:  User navigates multiple pages simultaneously:
      GET /home (token expired)
      GET /listings (token expired)
      GET /properties (token expired)

t=1:  Interceptors catch 3 × 401 errors
      ❌ AuthService() created 3 times
      ❌ 3 × POST /auth/refresh calls
      ❌ May conflict or cause race condition
      ❌ Tokens might get out of sync

t=5:  Responses received but:
      ❌ Multiple tokens stored (inconsistent state)
      ❌ Retry requests use different tokens
      ❌ Some requests still fail
      ❌ User sees errors on multiple pages
```

### After Fix ✅ - Single Coordinated Refresh

```
t=0:  User navigates multiple pages simultaneously:
      GET /home (token expired)
      GET /listings (token expired)
      GET /properties (token expired)

t=1:  Interceptors catch 3 × 401 errors

      First error enters _refreshTokenAndRetry():
      _isRefreshing = true ✅
      
      Queue created: [request1, request2, request3]
      
      POST /auth/refresh called once ✅

t=3:  Response received: { tokens: { accessToken, refreshToken } }
      
      ✅ One token stored
      ✅ All 3 queued requests get same new token
      ✅ _isRefreshing = false
      
      Retry all 3 requests:
      GET /home → 200 OK ✅
      GET /listings → 200 OK ✅
      GET /properties → 200 OK ✅

t=4:  All pages load with content
      ✅ Seamless user experience
      ✅ Single token refresh for all requests
      ✅ No conflicts or race conditions
```

---

## Refresh Token Expiration Scenario

### Before Fix ❌ - Poor Error Handling

```
Scenario: Refresh token expired (older than 7 days)

User navigates page:
  ↓
POST /auth/refresh {refreshToken: "expired_token"}
  ↓
Backend: 401 Unauthorized
  ("Invalid refresh token" or "Token expired")
  ↓
Client interceptor:
  ❌ May try to parse failed response
  ❌ May not have extractToken logic
  ❌ May not redirect to login
  ❌ User sees confusing error
  
Result: User stuck, must manually clear storage & login
```

### After Fix ✅ - Clear Error Handling

```
Scenario: Refresh token expired

User navigates page:
  ↓
POST /auth/refresh {refreshToken: "expired_token"}
  ↓
Backend: 401 Unauthorized
  ("Invalid refresh token" or "Token expired")
  ↓
Interceptor catches error:
  1. Check if URL is /auth/refresh
     → Yes, it is!
     → ✅ Don't retry
  
  2. Delete tokens:
     localStorage.removeItem('accessToken');
     localStorage.removeItem('refreshToken');
  
  3. Redirect to login:
     window.location.href = '/login';
     ✅ Clear user feedback
  
  4. Show login form
     ✅ User can login again
     
Result: Clear flow, user redirected to login automatically
```

---

## Error Handling Comparison

### Before vs After

| Scenario | Before | After |
|----------|--------|-------|
| **accessToken Expired** | ❌ Refresh fails, 401 shown | ✅ Auto-refresh, seamless |
| **refreshToken Expired** | ❌ Confusion, stuck | ✅ Auto-logout, clean redirect |
| **Network Error During Refresh** | ❌ May retry infinitely | ✅ Proper error, user notified |
| **Refresh Returns 401** | ❌ May retry infinitely | ✅ Redirects to login |
| **Multiple Concurrent Requests** | ❌ Race conditions | ✅ Coordinated queue |
| **Missing accessToken Response** | ❌ Silent failure | ✅ Throws error, user redirected |

---

## Response Format Recovery

### How After Fix Handles Both Formats

```typescript
// Backend can return either format (for backward compatibility):

// Format 1 (Old):
{ "accessToken": "...", "refreshToken": "..." }

// Format 2 (New - Correct):
{ "tokens": { "accessToken": "...", "refreshToken": "..." } }

// Client code handles both:
const tokens = response.data?.tokens || response.data;
      ↑                      ↑            ↑
      First try new format   Fallback to old format

// This ensures compatibility during migration
```

---

## The Complete Token Lifecycle After Fix

```
┌──────────────────────────────────────────────────────────┐
│ LOGIN                                                    │
│ POST /auth/otp/verify                                   │
│ ↓                                                        │
│ Response: { tokens: { accessToken, refreshToken } }    │
│ ↓                                                        │
│ Store: localStorage + secure storage                    │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ API REQUESTS (15 mins)                                  │
│ GET /home (accessToken valid)                           │
│ GET /listings (accessToken valid)                       │
│ GET /properties (accessToken valid)                     │
│ ✅ All succeed with 200 OK                              │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ EXPIRED TOKEN (15+ mins)                                │
│ GET /home (accessToken EXPIRED)                         │
│ ↓                                                        │
│ Response: 401 Unauthorized                              │
│ ↓                                                        │
│ Interceptor: POST /auth/refresh {refreshToken}         │
│ ↓                                                        │
│ Backend validates & returns new tokens                  │
│ ↓                                                        │
│ Client stores new tokens                                │
│ ↓                                                        │
│ Retry: GET /home (with new accessToken)                │
│ ↓                                                        │
│ ✅ Returns 200 OK                                        │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ CONTINUE USING APP (next 15 mins)                       │
│ GET /search ✅                                           │
│ POST /properties/create ✅                               │
│ POST /properties/images/upload ✅                        │
│ (cycle repeats when accessToken expires)               │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ REFRESH TOKEN EXPIRES (7 days)                          │
│ POST /auth/refresh (refreshToken EXPIRED)              │
│ ↓                                                        │
│ Response: 401 Unauthorized                              │
│ ↓                                                        │
│ Delete stored tokens                                    │
│ ↓                                                        │
│ Redirect: /login                                        │
│ ↓                                                        │
│ User sees login form                                    │
│ ✅ Clear, expected behavior                              │
└──────────────────────────────────────────────────────────┘
```

---

## Key Improvements Summary

| Area | Before | After |
|------|--------|-------|
| **Response Format** | ❌ Inconsistent | ✅ Wrapped in `{ tokens }` |
| **Parsing Logic** | ❌ Fails on new format | ✅ Handles both formats |
| **Refresh Loop Protection** | ❌ Missing | ✅ `if (url.includes('/auth/refresh'))` |
| **Token Validation** | ❌ No null checks | ✅ Validates accessToken exists |
| **Mobile Dependency** | ❌ Circular (AuthService) | ✅ Direct HTTP call |
| **Concurrent Requests** | ❌ Race conditions | ✅ Coordinated queue with `_isRefreshing` |
| **Error Messages** | ❌ Confusing | ✅ Clear redirects to login |
| **Token Cleanup** | ❌ Not on error | ✅ Cleaned on refresh failure |

---

**This fix ensures token refresh works reliably across all scenarios and platforms.**
