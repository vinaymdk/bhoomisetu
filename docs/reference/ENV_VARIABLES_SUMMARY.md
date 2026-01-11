# Environment Variables Summary (Quick Reference)

## ✅ Required Environment Variables

Copy these to your `backend/.env` file:

```env
# ===========================================
# REQUIRED - Server & Database
# ===========================================
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your-database-password-here
DB_NAME=bhoomisetu_db

# ===========================================
# REQUIRED - JWT Authentication
# ===========================================
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars-required
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ===========================================
# REQUIRED - Firebase (for OTP/Push Notifications)
# ===========================================
# Option 1: Path to Firebase credentials JSON file
FIREBASE_CREDENTIALS_PATH=./bhoomisetu-48706-firebase-adminsdk-fbsvc-6e896e4e57.json

# OR Option 2: Firebase credentials as environment variables
# FIREBASE_PROJECT_ID=your-firebase-project-id
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
# FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
```

## 🔧 Optional Environment Variables

These are optional but enhance functionality:

```env
# ===========================================
# OPTIONAL - AI Microservice (for fraud detection, AI chat, sentiment analysis)
# ===========================================
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your-ai-service-api-key
AI_SERVICE_REQUIRED=false

# ===========================================
# OPTIONAL - Google Maps (for geocoding/location services)
# ===========================================
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# ===========================================
# OPTIONAL - Cloudinary (for Image Storage - Module 4)
# ===========================================
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret

# ===========================================
# OPTIONAL - Payment Gateways (for Payments Module - Module 10)
# ===========================================
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

STRIPE_SECRET_KEY=sk_test_your-stripe-secret-key
STRIPE_WEBHOOK_SECRET=whsec_your-stripe-webhook-secret

# ===========================================
# OPTIONAL - SMS Provider (for Notifications Module - Module 9)
# ===========================================
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# ===========================================
# OPTIONAL - Email Provider (for Notifications Module - Module 9)
# ===========================================
SENDGRID_API_KEY=SG.your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@bhoomisetu.com

# ===========================================
# OPTIONAL - AWS Services (for Notifications Module - Module 9)
# ===========================================
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key-id
AWS_SECRET_ACCESS_KEY=your-aws-secret-access-key
SES_FROM_EMAIL=noreply@bhoomisetu.com
```

## 📋 Complete List by Usage

### Used in `backend/src/ai/ai.service.ts`:
- `AI_SERVICE_URL` (default: http://localhost:8000)
- `AI_SERVICE_API_KEY` (optional)
- `AI_SERVICE_REQUIRED` (default: false)

### Used in `backend/src/auth/auth.module.ts` and `auth.service.ts`:
- `JWT_SECRET` (required)
- `JWT_ACCESS_EXPIRES_IN` (default: 15m)
- `JWT_REFRESH_EXPIRES_IN` (default: 7d)

### Used in `backend/src/database/database.module.ts`:
- `DB_HOST` (default: localhost)
- `DB_PORT` (default: 5432)
- `DB_USERNAME` (default: postgres)
- `DB_PASSWORD` (required)
- `DB_NAME` (default: bhoomisetu_db)
- `NODE_ENV` (default: development)

### Used in `backend/src/firebase/firebase.service.ts`:
- `FIREBASE_CREDENTIALS_PATH` (optional - path to JSON file)
- `FIREBASE_PROJECT_ID` (optional - alternative to JSON file)
- `FIREBASE_PRIVATE_KEY` (optional - alternative to JSON file)
- `FIREBASE_CLIENT_EMAIL` (optional - alternative to JSON file)

### Used in `backend/src/main.ts`:
- `PORT` (default: 3000)
- `NODE_ENV` (default: development)

### Used in `backend/src/search/services/geocoding.service.ts`:
- `GOOGLE_MAPS_API_KEY` (optional)

### Used in `backend/src/search/services/ai-search.service.ts`:
- `AI_SERVICE_URL` (default: http://localhost:8000)
- `AI_SERVICE_API_KEY` (optional)

### Used in `backend/src/payments/payments.service.ts` (commented, ready for integration):
- `RAZORPAY_KEY_ID` (optional)
- `RAZORPAY_KEY_SECRET` (optional)
- `STRIPE_SECRET_KEY` (optional)
- `STRIPE_WEBHOOK_SECRET` (optional)

### Used in `backend/src/notifications/notifications.service.ts` (commented, ready for integration):
- `TWILIO_ACCOUNT_SID` (optional)
- `TWILIO_AUTH_TOKEN` (optional)
- `TWILIO_PHONE_NUMBER` (optional)
- `SENDGRID_API_KEY` (optional)
- `SENDGRID_FROM_EMAIL` (optional)
- `AWS_REGION` (optional)
- `AWS_ACCESS_KEY_ID` (optional)
- `AWS_SECRET_ACCESS_KEY` (optional)
- `SES_FROM_EMAIL` (optional)

## 🚀 Quick Start

1. **Copy `.env.example` to `.env`:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Update required variables:**
   - `DB_PASSWORD` - Your PostgreSQL password
   - `JWT_SECRET` - Generate a strong secret (min 32 characters)
   - `FIREBASE_CREDENTIALS_PATH` - Path to your Firebase credentials JSON file

3. **Start the application:**
   ```bash
   npm run start:dev
   ```

4. **Verify `.env` loading:**
   - Check console output for: `✅ .env file loaded from: /path/to/.env`
   - If you see: `⚠️  .env file not found...`, ensure `.env` exists in `backend/` directory

## 📝 Notes

- **Never commit `.env` file** - It's already in `.gitignore`
- **Production**: Use environment variables or secure secret management instead of `.env` file
- **AI Service**: Set `AI_SERVICE_REQUIRED=false` to allow app to work without AI service (graceful degradation)
- **Payment Gateways**: Optional - app will work in test mode without them
- **SMS/Email**: Optional - notifications will use Firebase Push by default

For complete documentation, see [`ENV_VARIABLES.md`](./ENV_VARIABLES.md).
