# Bhoomisetu Documentation

This directory contains all documentation organized by category.

## 📁 Folder Structure

### `/docs/summary/` - Module Summaries
Implementation summaries for each module:
- `MODULE2_SUMMARY.md` - Landing/Home Module
- `MODULE3_SUMMARY.md` - AI Powered Property Search
- `MODULE4_SUMMARY.md` - Seller Property Listing (Image Upload)
- `MODULE5_SUMMARY.md` - Customer Service Verification
- `MODULE6_SUMMARY.md` - Buyer Requirement Posting
- `MODULE7_SUMMARY.md` - Mediation & Negotiation
- `MODULE8_SUMMARY.md` - AI Chat Support
- `MODULE9_SUMMARY.md` - Notifications
- `MODULE10_SUMMARY.md` - Payments & Subscriptions
- `MODULE11_SUMMARY.md` - Reviews & Feedback
- `MODULE12_SUMMARY.md` - Admin Panel
- `AI_INTEGRATION_SUMMARY.md` - AI Service Integration
- `PROGRESS_SUMMARY.md` - Overall Project Progress

### `/docs/testing/` - Testing Documentation
Testing summaries and verification reports:
- `CODE_VERIFICATION_REPORT.md` - Post-Git verification report
- `MODULE10_TESTING_SUMMARY.md` - Payments module testing
- `MODULE11_TESTING_SUMMARY.md` - Reviews module testing
- `MODULE12_TESTING_SUMMARY.md` - Admin Panel testing
- `MODULE8_TESTING_SUMMARY.md` - AI Chat testing
- `MODULE9_TESTING_SUMMARY.md` - Notifications testing
- `MODULES_5_6_7_TESTING_SUMMARY.md` - Customer Service, Buyer Requirements, Mediation testing
- `MODULES_8_9_REVIEW_AND_TESTING.md` - AI Chat and Notifications review

### `/docs/setup/` - Setup Guides
Configuration and setup instructions:
- `AUTH_SETUP.md` - Authentication & Authorization setup (JWT, RBAC)
- `DATABASE_SETUP.md` - PostgreSQL database setup
- `FIREBASE_SETUP.md` - Firebase Admin SDK setup

### `/docs/reference/` - API References & Contracts
Technical references and API contracts:
- `ENV_VARIABLES.md` - **Complete Environment Variables Reference** ⭐
- `AI_MICROSERVICE_CONTRACT.md` - AI microservice API contract
- `AI_SERVICE_ERROR_HANDLING.md` - AI service error handling guide
- `firebase.reference.md` - Firebase reference
- `reference.commands.md` - Common commands reference

### `/docs/guides/` - Development Guides
Development guides and best practices:
- `NEXT_STEPS.md` - Next development steps
- `ERROR_HANDLING_IMPROVEMENTS.md` - Error handling best practices

### Root Level Docs
- `CHANGELOG.md` - Version history and changes
- `ROADMAP.md` - Project roadmap and module status

## 🔧 Quick Links

### Setup & Configuration
1. **Environment Variables**: See [`/docs/reference/ENV_VARIABLES.md`](./reference/ENV_VARIABLES.md) or `backend/.env.example`
2. **Database Setup**: [`/docs/setup/DATABASE_SETUP.md`](./setup/DATABASE_SETUP.md)
3. **Firebase Setup**: [`/docs/setup/FIREBASE_SETUP.md`](./setup/FIREBASE_SETUP.md)
4. **Auth Setup**: [`/docs/setup/AUTH_SETUP.md`](./setup/AUTH_SETUP.md)

### API References
1. **AI Service Contract**: [`/docs/reference/AI_MICROSERVICE_CONTRACT.md`](./reference/AI_MICROSERVICE_CONTRACT.md)
2. **Environment Variables**: [`/docs/reference/ENV_VARIABLES.md`](./reference/ENV_VARIABLES.md)

### Module Documentation
- See individual module summaries in `/docs/summary/`
- See testing documentation in `/docs/testing/`

## 📝 Notes

- All module summaries are in `/docs/summary/`
- All testing documentation is in `/docs/testing/`
- All setup guides are in `/docs/setup/`
- All API references are in `/docs/reference/`
- All development guides are in `/docs/guides/`

## 🔐 Environment Variables

**Important**: See [`/docs/reference/ENV_VARIABLES.md`](./reference/ENV_VARIABLES.md) for complete environment variables reference, or check `backend/.env.example` for a template.

**Required Variables:**
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` (Database)
- `JWT_SECRET` (Authentication)
- `FIREBASE_CREDENTIALS_PATH` or Firebase env vars (OTP/Push)

**Optional Variables:**
- `AI_SERVICE_URL`, `AI_SERVICE_API_KEY` (AI Service)
- `GOOGLE_MAPS_API_KEY` (Geocoding)
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (Payments)
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (Payments)
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN` (SMS)
- `SENDGRID_API_KEY`, `SENDGRID_FROM_EMAIL` (Email)
