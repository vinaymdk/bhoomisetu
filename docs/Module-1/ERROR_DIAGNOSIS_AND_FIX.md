# Error Diagnosis: 400 Errors and Login Redirect Issues
**Date:** January 13, 2026

---

## 🔴 Issues Reported

1. **Request failed with status code 400 and redirecting to login page**
2. **After login, user tries Property/Search → Request failed → logout → redirecting to login**

---

## 🔍 Root Cause Analysis

### Issue 1: 400 Errors Not Properly Handled

The API interceptor in `web/src/config/api.ts` only handles **401 (Unauthorized)** errors to redirect to login. **400 (Bad Request)** errors are passed through without special handling.

However, the error might be:
- A validation error from the backend
- Missing or invalid query parameters
- Invalid request format

### Issue 2: Error Handling Flow

Current flow:
1. API call fails with 400
2. Error is thrown and caught in component
3. Error message is displayed
4. BUT: If the error handling is not correct, it might trigger navigation

### Potential Causes:

1. **Home/Dashboard Endpoint Issues:**
   - Query parameters might not be properly formatted
   - Backend validation might be rejecting requests

2. **Properties/Search Endpoint Issues:**
   - Filter parameters might be invalid
   - Missing required parameters

3. **Token Issues:**
   - Token might be invalid/expired
   - Token refresh might be failing

---

## 🛠️ Fixes Needed

### Fix 1: Improve Error Handling in API Client

The API client should:
- Not redirect on 400 errors (these are client errors, not auth errors)
- Only redirect to login on 401 errors
- Provide better error messages

### Fix 2: Improve Error Handling in Components

Components should:
- Display user-friendly error messages
- Not trigger navigation on 400 errors
- Handle errors gracefully

### Fix 3: Add Error Logging

Add better error logging to understand what's causing 400 errors.

---

## 📝 Next Steps

1. Check backend logs for 400 error details
2. Improve API error handling
3. Add better error messages
4. Test the fixes
5. Test Module 2 functionality
