# Environment Variables Setup Guide

## ✅ Fixed: .env File Loading

The `.env` file loading has been fixed in `backend/src/main.ts`. The application now:
1. ✅ Tries multiple paths to find `.env` file
2. ✅ Loads from `backend/.env` explicitly
3. ✅ Falls back to process environment variables if `.env` not found
4. ✅ Logs the loaded `.env` path for debugging

## 📋 Required Environment Variables

Copy these to your `backend/.env` file:

```env
# ===========================================
# REQUIRED - Server Configuration
# ===========================================
PORT=3000
NODE_ENV=development

# ===========================================
# REQUIRED - Database Configuration (PostgreSQL)
# ===========================================
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
# Option 1: Path to Firebase credentials JSON file (Recommended for Development)
FIREBASE_CREDENTIALS_PATH=./bhoomisetu-48706-firebase-adminsdk-fbsvc-6e896e4e57.json

# OR Option 2: Firebase credentials as environment variables (for Production/Containers)
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

## 🚀 Quick Setup

1. **Copy `.env.example` to `.env`:**
   ```bash
   cd backend
   cp .env.example .env
   ```

2. **Update required variables in `.env`:**
   - `DB_PASSWORD` - Your PostgreSQL password
   - `JWT_SECRET` - Generate a strong secret (min 32 characters)
   - `FIREBASE_CREDENTIALS_PATH` - Path to your Firebase credentials JSON file

3. **Install dotenv (if not already installed):**
   ```bash
   cd backend
   npm install dotenv
   ```

4. **Start the application:**
   ```bash
   npm run start:dev
   ```

5. **Verify `.env` loading:**
   - Check console output for: `✅ .env file loaded from: /path/to/.env`
   - If you see: `⚠️  .env file not found...`, ensure `.env` exists in `backend/` directory

## 📝 Notes

- **`.env` file location**: Must be in `backend/` directory
- **Never commit `.env`**: Already in `.gitignore`
- **Production**: Use environment variables or secure secret management
- **AI Service**: Set `AI_SERVICE_REQUIRED=false` to allow graceful degradation
- **Payment Gateways**: Optional - app works in test mode without them
- **SMS/Email**: Optional - notifications use Firebase Push by default

## 🔍 Troubleshooting

### Issue: `.env` file not found
**Solution:** 
- Ensure `.env` file exists in `backend/` directory
- Check console output for loaded path
- Verify file permissions: `chmod 644 backend/.env`

### Issue: AI Service Connection Errors
**Solution:** 
- Set `AI_SERVICE_REQUIRED=false` in `.env` to allow graceful degradation
- Or ensure AI service is running at `AI_SERVICE_URL`

### Issue: Firebase Authentication Fails
**Solution:** 
- Verify `FIREBASE_CREDENTIALS_PATH` points to valid JSON file
- Or set Firebase environment variables (`FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`)

For complete documentation, see:
- [`../docs/reference/ENV_VARIABLES.md`](../docs/reference/ENV_VARIABLES.md) - Complete reference
- [`../docs/reference/ENV_VARIABLES_SUMMARY.md`](../docs/reference/ENV_VARIABLES_SUMMARY.md) - Quick summary
