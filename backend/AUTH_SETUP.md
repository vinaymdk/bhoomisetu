# Authentication & Authorization Setup (Module 1 - Part A)

## ✅ Completed: JWT Guards + Role Guards + Request User Wiring

### What's Implemented

1. **JWT Strategy & Guards**
   - `JwtStrategy` validates JWT tokens and loads user from database
   - `JwtAuthGuard` protects routes (can be bypassed with `@Public()` decorator)
   - Global guard configured in `AppModule` - all routes require auth by default

2. **Role-Based Access Control**
   - `RolesGuard` checks if user has required roles
   - `@Roles('buyer', 'seller')` decorator to specify required roles on endpoints

3. **Decorators**
   - `@Public()` - Marks route as public (bypasses JWT guard)
   - `@Roles(...roles)` - Specifies required roles for endpoint
   - `@CurrentUser()` - Injects current user data into controller method

4. **JWT Token Generation**
   - `AuthService.generateTokens()` creates access + refresh tokens
   - Tokens include user ID, roles, email, phone
   - Configurable expiration via env vars

5. **Updated Controllers**
   - `AuthController` - All endpoints marked `@Public()` (login/register)
   - `UsersController` - Protected with `JwtAuthGuard`, uses `@CurrentUser()`

### Environment Variables Needed

Add to your `.env` file:

```env
JWT_SECRET=your-super-secret-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### Usage Examples

#### Public Endpoint (No Auth Required)
```typescript
@Public()
@Post('auth/otp/request')
requestOtp(@Body() dto: RequestOtpDto) {
  // No auth required
}
```

#### Protected Endpoint (Auth Required)
```typescript
@Get('users/me')
getMe(@CurrentUser() currentUser: CurrentUserData) {
  // JWT required, user automatically loaded
  return { user: currentUser.user, roles: currentUser.roles };
}
```

#### Role-Protected Endpoint
```typescript
@Roles('admin', 'customer_service')
@Get('admin/users')
getAllUsers() {
  // Requires admin OR customer_service role
}
```

### Next Steps

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set Environment Variables**
   - Create `.env` file with `JWT_SECRET` and expiration settings

3. **Test the Setup**
   - Start the server: `npm run start:dev`
   - Try accessing `/api/users/me` without token (should fail)
   - Try `/api/auth/otp/request` (should work - public endpoint)

4. **What You Can Do**
   - Test JWT token generation by calling auth endpoints
   - Add role checks to new endpoints using `@Roles()` decorator
   - Use `@CurrentUser()` in any controller to get authenticated user
   - Mark new public endpoints with `@Public()` decorator

### Files Created/Modified

- `src/auth/strategies/jwt.strategy.ts` - JWT validation strategy
- `src/auth/guards/jwt-auth.guard.ts` - JWT authentication guard
- `src/auth/guards/roles.guard.ts` - Role-based access guard
- `src/auth/decorators/*.ts` - Public, Roles, CurrentUser decorators
- `src/auth/auth.service.ts` - Added JWT token generation
- `src/auth/auth.module.ts` - Configured JWT and Passport modules
- `src/app.module.ts` - Set up global JWT guard
- `package.json` - Added JWT and Passport dependencies
