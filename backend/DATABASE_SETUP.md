# Database Setup Guide (Module 1 - Part B)

## ✅ Completed: TypeORM Integration with PostgreSQL

### What's Implemented

1. **TypeORM Entities**
   - `User` entity - User accounts with soft deletes
   - `Role` entity - Available roles
   - `UserRole` entity - User-role assignments
   - `LoginSession` entity - Active login sessions
   - `OtpLog` entity - OTP request/verification logs

2. **Database Module**
   - TypeORM configuration with PostgreSQL
   - Connection pooling
   - Migration support
   - Entity registration

3. **Repository Integration**
   - `UsersService` uses TypeORM repositories
   - `AuthService` uses TypeORM repositories
   - Real database queries instead of placeholders

4. **Features**
   - User lookup by ID, email, phone, Firebase UID
   - Role assignment and retrieval
   - Login session management
   - Refresh token persistence and validation

### Database Configuration

The database connection is configured in `src/database/database.module.ts` and uses environment variables:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=bhoomisetu_db
```

### Running Migrations

#### Option 1: Direct SQL (Recommended for initial setup)

```bash
# Create database
createdb bhoomisetu_db

# Run migration
psql -U postgres -d bhoomisetu -f ../db/migrations/20260109_initial_auth_schema.sql
```

#### Option 2: TypeORM CLI

```bash
# Run migrations
npm run migration:run

# Generate new migration
npm run migration:generate -- -n MigrationName

# Revert last migration
npm run migration:revert
```

### Entity Relationships

```
User (1) ──< (N) UserRole (N) >── (1) Role
User (1) ──< (N) LoginSession
```

### Key Methods

#### UsersService

- `findById(id)` - Find user by ID with roles
- `findByFirebaseUid(uid)` - Find user by Firebase UID
- `findByEmail(email)` - Find user by email
- `findByPhone(phone)` - Find user by phone
- `getUserRoles(userId)` - Get user's role codes
- `findOrCreateByFirebaseUid(payload)` - Find or create user
- `updateLastLogin(userId)` - Update last login timestamp

#### AuthService

- `generateTokens()` - Creates JWT tokens and saves session
- `refreshTokens()` - Validates and refreshes tokens
- All methods now use real database queries

### Next Steps

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set Up Database**
   - Create PostgreSQL database
   - Run initial migration
   - Verify tables are created

3. **Test the Integration**
   - Start the server: `npm run start:dev`
   - Try creating a user via auth endpoints
   - Check database to verify data persistence

4. **What You Can Do**
   - Query users directly from database
   - Add custom repository methods
   - Create new entities following the same pattern
   - Use TypeORM migrations for schema changes

### Files Created/Modified

- `src/database/database.module.ts` - Database configuration
- `src/database/data-source.ts` - TypeORM data source for CLI
- `src/users/entities/user.entity.ts` - User entity
- `src/auth/entities/role.entity.ts` - Role entity
- `src/auth/entities/user-role.entity.ts` - UserRole entity
- `src/auth/entities/login-session.entity.ts` - LoginSession entity
- `src/auth/entities/otp-log.entity.ts` - OtpLog entity
- `src/users/users.service.ts` - Updated to use repositories
- `src/auth/auth.service.ts` - Updated to use repositories
- `src/users/users.module.ts` - Added TypeORM imports
- `src/auth/auth.module.ts` - Added TypeORM imports
- `src/app.module.ts` - Added DatabaseModule
- `package.json` - Added TypeORM and PostgreSQL dependencies
