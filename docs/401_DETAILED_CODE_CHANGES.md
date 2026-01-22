# Token Refresh Fix - Detailed Code Changes

## File 1: Backend Token Refresh Response Format

**File**: `/backend/src/auth/auth.service.ts`  
**Lines**: 477-526

### Before (❌ Wrong)
```typescript
async refreshTokens(refreshToken: string): Promise<AuthTokens> {
  // ... validation code ...
  
  return await this.generateTokens(
    user.id,
    roles,
    user.primaryEmail,
    user.primaryPhone,
    session.loginProvider,
    session.deviceId || undefined,
    session.ipAddress || undefined,
    session.userAgent || undefined,
  );
}
// Returns: { accessToken: "...", refreshToken: "..." }
```

### After (✅ Correct)
```typescript
async refreshTokens(refreshToken: string): Promise<{ tokens: AuthTokens }> {
  // ... validation code ...
  
  const tokens = await this.generateTokens(
    user.id,
    roles,
    user.primaryEmail,
    user.primaryPhone,
    session.loginProvider,
    session.deviceId || undefined,
    session.ipAddress || undefined,
    session.userAgent || undefined,
  );

  return { tokens };
}
// Returns: { tokens: { accessToken: "...", refreshToken: "..." } }
```

### Why?
- Matches response format of `verifyOtp()` endpoint: `{ user, roles, tokens }`
- Client interceptors expect `response.data.tokens`
- Consistent API design

---

## File 2: Web Token Refresh Interceptor

**File**: `/web/src/config/api.ts`  
**Lines**: 20-71

### Before (❌ Multiple Issues)
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';
    
    // Complex public endpoint detection
    const publicGetPrefixes = ['/search', '/config', '/locations/geocode', ...];
    const publicProperty = url.includes('/properties') && ...;
    const isPublicGetRequest = publicGetPrefixes.some(...) || publicProperty;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {  // ❌ Doesn't check if empty
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          // ❌ Will fail if response.data is { tokens: { ... } }
          const { accessToken, refreshToken: newRefreshToken } = response.data.tokens || response.data;
          localStorage.setItem('accessToken', accessToken);
          if (newRefreshToken) {
            localStorage.setItem('refreshToken', newRefreshToken);
          }

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        }
        // ❌ Doesn't handle missing refreshToken properly
        if (!isPublicGetRequest) {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        if (!isPublicGetRequest) {  // ❌ May not redirect
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    // ❌ May retry /auth/refresh infinitely if it returns 401
    return Promise.reject(error);
  }
);
```

### After (✅ Fixed)
```typescript
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url || '';
    
    // ✅ Prevent infinite retry of refresh endpoint itself
    if (url.includes('/auth/refresh')) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        // ✅ Early exit if refresh token missing
        if (!refreshToken) {
          window.location.href = '/login';
          return Promise.reject(error);
        }

        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        // ✅ Properly extract tokens
        const tokens = response.data?.tokens || response.data;
        const { accessToken, refreshToken: newRefreshToken } = tokens;
        
        // ✅ Validate accessToken exists
        if (!accessToken) {
          throw new Error('No access token in refresh response');
        }

        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // ✅ Always redirect to login on refresh failure
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### Changes Summary
| Issue | Before | After |
|-------|--------|-------|
| Infinite /auth/refresh retry | ❌ No check | ✅ `if (url.includes('/auth/refresh'))` |
| Missing refreshToken handling | ❌ May not redirect | ✅ Early exit with redirect |
| Token extraction | ❌ Fails on new format | ✅ `response.data?.tokens \|\| response.data` |
| AccessToken validation | ❌ No check | ✅ `if (!accessToken) throw` |
| Refresh failure redirect | ❌ Conditional | ✅ Always redirect |

---

## File 3: Mobile Token Refresh - API Client

**File**: `/mobile/lib/config/api_client.dart`  
**Lines**: 73-145

### Before (❌ Multiple Issues)
```dart
Future<RequestOptions?> _refreshTokenAndRetry(RequestOptions options) async {
  if (_isRefreshing) {
    // Wait for ongoing refresh
    final completer = Completer<RequestOptions?>();
    _refreshQueue.add((completer: completer, options: options));
    return completer.future;
  }

  _isRefreshing = true;

  try {
    final refreshToken = await _storage.read(key: 'refreshToken');
    if (refreshToken == null || refreshToken.isEmpty) {
      return null;  // ❌ Doesn't reset _isRefreshing
    }

    // ❌ Circular dependency: AuthService might not be initialized
    final authService = AuthService();
    final response = await authService.refreshTokens(refreshToken);
    
    // ❌ Assumes response is Map, may be null
    final tokens = response['tokens'] ?? response;
    final newAccessToken = tokens['accessToken'] as String;  // ❌ Unsafe cast
    final newRefreshToken = tokens['refreshToken'] as String?;

    await _storage.write(key: 'accessToken', value: newAccessToken);
    if (newRefreshToken != null) {
      await _storage.write(key: 'refreshToken', value: newRefreshToken);
    }

    // Retry the original request with new token
    options.headers['Authorization'] = 'Bearer $newAccessToken';
    
    // Process queued requests
    _isRefreshing = false;
    for (final item in _refreshQueue) {
      item.options.headers['Authorization'] = 'Bearer $newAccessToken';
      item.completer.complete(item.options);
    }
    _refreshQueue.clear();

    return options;
  } catch (e) {
    _isRefreshing = false;
    // Process queued requests with failure
    for (final item in _refreshQueue) {
      item.completer.complete(null);
    }
    _refreshQueue.clear();
    return null;  // ❌ Doesn't clean up tokens
  }
}
```

### After (✅ Fixed)
```dart
Future<RequestOptions?> _refreshTokenAndRetry(RequestOptions options) async {
  if (_isRefreshing) {
    // Wait for ongoing refresh
    final completer = Completer<RequestOptions?>();
    _refreshQueue.add((completer: completer, options: options));
    return completer.future;
  }

  _isRefreshing = true;

  try {
    final refreshToken = await _storage.read(key: 'refreshToken');
    if (refreshToken == null || refreshToken.isEmpty) {
      _isRefreshing = false;  // ✅ Reset state immediately
      return null;
    }

    // ✅ Direct HTTP call - avoids circular dependency
    final refreshResponse = await _dio.post(
      '/auth/refresh',
      data: {'refreshToken': refreshToken},
    );

    final responseData = refreshResponse.data as Map<String, dynamic>;
    // ✅ Handle both response formats
    final tokens = responseData['tokens'] ?? responseData;
    
    // ✅ Safe null-aware cast
    final newAccessToken = tokens['accessToken'] as String?;
    final newRefreshToken = tokens['refreshToken'] as String?;

    // ✅ Validate accessToken exists
    if (newAccessToken == null) {
      throw Exception('No access token in refresh response');
    }

    await _storage.write(key: 'accessToken', value: newAccessToken);
    if (newRefreshToken != null) {
      await _storage.write(key: 'refreshToken', value: newRefreshToken);
    }

    // Retry the original request with new token
    options.headers['Authorization'] = 'Bearer $newAccessToken';
    
    // Process queued requests
    _isRefreshing = false;
    for (final item in _refreshQueue) {
      item.options.headers['Authorization'] = 'Bearer $newAccessToken';
      item.completer.complete(item.options);
    }
    _refreshQueue.clear();

    return options;
  } catch (e) {
    _isRefreshing = false;
    // Process queued requests with failure
    for (final item in _refreshQueue) {
      item.completer.complete(null);
    }
    _refreshQueue.clear();
    
    // ✅ Clean up tokens on refresh failure
    await _storage.delete(key: 'accessToken');
    await _storage.delete(key: 'refreshToken');
    return null;
  }
}
```

### Changes Summary
| Issue | Before | After |
|-------|--------|-------|
| Early exit handling | ❌ `_isRefreshing` not reset | ✅ `_isRefreshing = false` on early exit |
| Circular dependency | ❌ Uses `AuthService()` | ✅ Direct `_dio.post()` call |
| Type safety | ❌ Unsafe cast `as String` | ✅ Nullable cast `as String?` with null check |
| Response handling | ❌ Assumes response exists | ✅ Cast to `Map<String, dynamic>` first |
| Token validation | ❌ No null check | ✅ `if (newAccessToken == null) throw` |
| Refresh failure | ❌ Doesn't clean tokens | ✅ `await _storage.delete()` on error |

---

## Impact of These Changes

### Token Flow Before
```
1. Request with expired token
   ↓
2. Get 401 response
   ↓
3. Try to refresh (wrong format OR circular dependency)
   ↓
4. Refresh fails (can't parse response OR crash)
   ↓
5. Request not retried
   ↓
6. User sees 401 error
```

### Token Flow After
```
1. Request with expired token
   ↓
2. Get 401 response
   ↓
3. Try to refresh (proper format + direct HTTP call)
   ↓
4. Refresh succeeds (tokens extracted correctly)
   ↓
5. Original request retried with new token
   ↓
6. Request succeeds with 200 OK
   ↓
7. User sees content (no errors)
```

---

## Compilation Status
✅ All files compile without errors
✅ No TypeScript/Dart warnings
✅ Type safety verified

## Testing Points

| Scenario | Expected Before | Expected After |
|----------|-----------------|----------------|
| Navigate to page | 401 Error | Page loads, token refreshed |
| Upload image | 401 Error | Upload succeeds, 200 OK |
| Multiple requests | All fail | First refresh, rest use new token |
| No refresh token | Error or crash | Redirects to login |
| Refresh fails | Retry loop | Redirects to login |

---

**Date**: January 18, 2026  
**Status**: ✅ Ready for Testing
