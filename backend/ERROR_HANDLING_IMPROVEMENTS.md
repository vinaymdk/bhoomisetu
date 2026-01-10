# Error Handling Improvements

## Issue Fixed

Connection errors to AI service were being logged as **ERROR** with full stack traces, creating noise in development logs when the AI service is not running.

## Solution

Improved error handling to treat connection errors as expected behavior with graceful fallback:

### Changes Made

1. **Connection Error Detection**:
   - Checks for `ECONNREFUSED`, `ETIMEDOUT`, `ENOTFOUND` error codes
   - These are now treated as warnings (not errors)
   - Logged only once per service instance to reduce noise

2. **Improved Logging**:
   - Connection errors: **WARNING** level (logged once)
   - Actual errors: **ERROR** level (with stack trace)
   - Search ranking errors: **DEBUG/WARNING** level

3. **Fallback Behavior**:
   - AI service unavailable → Returns safe defaults
   - No exceptions thrown (unless `AI_SERVICE_REQUIRED=true`)
   - Application continues normally

4. **Environment Variable**:
   - `AI_SERVICE_REQUIRED=false` (default) → Graceful fallback
   - `AI_SERVICE_REQUIRED=true` → Throws exceptions on connection errors

### Before

```
[ERROR] [AiService] Error calling AI fraud detection service: connect ECONNREFUSED 127.0.0.1:8000
<full stack trace>
[WARN] [AiService] AI service unavailable, returning safe default
```

### After

```
[WARN] [AiService] AI service unavailable at http://localhost:8000. Using fallback defaults. Set AI_SERVICE_REQUIRED=false to suppress this warning.
```

(Subsequent connection errors are not logged)

## Files Modified

- `backend/src/ai/ai.service.ts` - Improved error handling for all AI methods
- `backend/src/search/services/ai-search.service.ts` - Improved ranking error handling
- `backend/src/search/services/geocoding.service.ts` - Improved geocoding error handling

## Testing

1. **With AI Service Unavailable** (Default):
   ```bash
   # Start backend without AI service
   npm run start:dev
   ```
   - Should see one warning message
   - Application continues normally
   - No repeated error logs

2. **With AI Service Available**:
   ```bash
   # Start AI service first
   python ai-service/app.py
   
   # Then start backend
   npm run start:dev
   ```
   - No warnings
   - Full AI functionality enabled

3. **With AI Service Required**:
   ```env
   AI_SERVICE_REQUIRED=true
   ```
   - Connection errors throw `SERVICE_UNAVAILABLE` exceptions
   - Use in production when AI service is critical

## Result

- ✅ Reduced log noise during development
- ✅ Clear distinction between connection errors and actual errors
- ✅ Graceful degradation when AI service unavailable
- ✅ Configurable behavior via environment variables
- ✅ All functionality remains available without AI service

---

**Status**: ✅ Fixed
**Date**: 2024-01-10
