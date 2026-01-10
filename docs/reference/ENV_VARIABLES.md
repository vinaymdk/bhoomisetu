# Environment Variables Reference

This document lists all environment variables used in the Bhoomisetu backend application.

## Quick Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cd backend
   cp .env.example .env
   ```

2. Update `.env` with your actual values (see sections below)

3. The application will automatically load `.env` from the backend directory

---

## Required Environment Variables

### Server Configuration
```env
PORT=3000                    # Server port (default: 3000)
NODE_ENV=development         # Environment: development | production | test
```

### Database Configuration (PostgreSQL) - **REQUIRED**
```env
DB_HOST=localhost           # PostgreSQL host
DB_PORT=5432                # PostgreSQL port
DB_USERNAME=postgres        # PostgreSQL username
DB_PASSWORD=your-password   # PostgreSQL password
DB_NAME=bhoomisetu_db       # Database name
```

### JWT Authentication - **REQUIRED**
```env
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m   # Access token expiration (default: 15m)
JWT_REFRESH_EXPIRES_IN=7d   # Refresh token expiration (default: 7d)
```

---

## Optional Environment Variables

### AI Microservice Configuration
```env
AI_SERVICE_URL=http://localhost:8000        # AI microservice URL (default: http://localhost:8000)
AI_SERVICE_API_KEY=your-api-key             # API key for AI service authentication
AI_SERVICE_REQUIRED=false                   # Set to 'true' to require AI service (default: false - graceful degradation)
```

**Notes:**
- If `AI_SERVICE_REQUIRED=false`, the app will work without AI service (returns safe defaults)
- If `AI_SERVICE_REQUIRED=true`, the app will throw errors if AI service is unavailable
- AI service is used for: fraud detection, duplicate account detection, sentiment analysis, fake review detection, AI chat, property search ranking

### Firebase Configuration
**Option 1: JSON File Path (Recommended for Development)**
```env
FIREBASE_CREDENTIALS_PATH=./bhoomisetu-48706-firebase-adminsdk-fbsvc-6e896e4e57.json
```

**Option 2: Environment Variables (Recommended for Production/Containers)**
```env
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
```

**Notes:**
- Used for: OTP authentication, push notifications
- The service will look for credentials in this order:
  1. `FIREBASE_CREDENTIALS_PATH` if set
  2. Default location: `backend/bhoomisetu-48706-firebase-adminsdk-fbsvc-6e896e4e57.json`
  3. Environment variables (`FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`)

### Google Maps API (For Geocoding/Location Services)
```env
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

**Notes:**
- Used for: Location normalization, geocoding in property search
- If not provided, the app will use basic location parsing (graceful degradation)

---

## Payment Gateway Configuration (Optional - Module 10)

### Razorpay
```env
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
```

### Stripe
```env
STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret
```

**Notes:**
- Payment gateways are optional - the payments module will work in test mode without them
- Configure at least one gateway for production payments

---

## Notification Providers (Optional - Module 9)

### SMS Provider - Twilio
```env
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890
```

### Email Provider - SendGrid
```env
SENDGRID_API_KEY=SG.your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@bhoomisetu.com
```

### AWS Services (SMS via SNS / Email via SES)
```env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
SES_FROM_EMAIL=noreply@bhoomisetu.com
```

**Notes:**
- SMS/Email providers are optional - notifications will use Firebase Push by default
- Configure at least one provider for SMS/Email notifications

---

## Environment Variables by Module

### Module 1: Authentication & Roles
- `JWT_SECRET` (required)
- `JWT_ACCESS_EXPIRES_IN` (optional, default: 15m)
- `JWT_REFRESH_EXPIRES_IN` (optional, default: 7d)
- `FIREBASE_CREDENTIALS_PATH` or Firebase env vars (required for OTP)

### Module 3: AI Powered Property Search
- `AI_SERVICE_URL` (optional, default: http://localhost:8000)
- `AI_SERVICE_API_KEY` (optional)
- `AI_SERVICE_REQUIRED` (optional, default: false)
- `GOOGLE_MAPS_API_KEY` (optional)

### Module 8: AI Chat Support
- `AI_SERVICE_URL` (optional)
- `AI_SERVICE_API_KEY` (optional)
- `AI_SERVICE_REQUIRED` (optional)

### Module 9: Notifications
- `TWILIO_ACCOUNT_SID` (optional, for SMS)
- `TWILIO_AUTH_TOKEN` (optional, for SMS)
- `TWILIO_PHONE_NUMBER` (optional, for SMS)
- `SENDGRID_API_KEY` (optional, for Email)
- `SENDGRID_FROM_EMAIL` (optional, for Email)
- `AWS_REGION` (optional, for AWS SMS/Email)
- `AWS_ACCESS_KEY_ID` (optional, for AWS SMS/Email)
- `AWS_SECRET_ACCESS_KEY` (optional, for AWS SMS/Email)
- `SES_FROM_EMAIL` (optional, for AWS SES)

### Module 10: Payments & Subscriptions
- `RAZORPAY_KEY_ID` (optional)
- `RAZORPAY_KEY_SECRET` (optional)
- `STRIPE_SECRET_KEY` (optional)
- `STRIPE_WEBHOOK_SECRET` (optional)

### Module 11: Reviews & Feedback
- `AI_SERVICE_URL` (optional, for sentiment analysis and fake review detection)
- `AI_SERVICE_API_KEY` (optional)

---

## .env File Location

The application looks for `.env` file in the following locations (in order):

1. `backend/.env` (relative to compiled dist/ directory)
2. Project root `.env` (if running from project root)
3. `backend/../.env` (if running from backend/ directory)
4. Current working directory

**Recommended:** Place `.env` file in `backend/` directory

---

## Security Notes

1. **Never commit `.env` file to version control**
   - `.env` is already in `.gitignore`
   - Use `.env.example` as template

2. **Production Deployment:**
   - Use environment variables instead of `.env` file
   - Use secure secret management (AWS Secrets Manager, HashiCorp Vault, etc.)
   - Never hardcode secrets in code

3. **Required for Production:**
   - `JWT_SECRET` - Must be strong (min 32 characters, random)
   - `DB_PASSWORD` - Strong database password
   - `FIREBASE_CREDENTIALS` - Valid Firebase Admin SDK credentials
   - Payment gateway keys (if using payments)
   - SMS/Email provider keys (if using SMS/Email)

---

## Validation

The application will log environment variable values on startup (for debugging):
```
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=***
DB_NAME=bhoomisetu_db
```

**Note:** Passwords and secrets are masked in logs for security.

---

## Troubleshooting

### Issue: `.env` file not found
**Solution:** Ensure `.env` file exists in `backend/` directory or set environment variables directly

### Issue: AI Service Connection Errors
**Solution:** Set `AI_SERVICE_REQUIRED=false` to allow graceful degradation, or ensure AI service is running

### Issue: Firebase Authentication Fails
**Solution:** Verify `FIREBASE_CREDENTIALS_PATH` points to valid JSON file, or set Firebase environment variables

### Issue: Database Connection Fails
**Solution:** Verify database credentials (`DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`)

---

## Complete .env Template

See `backend/.env.example` for complete template with all optional variables.
