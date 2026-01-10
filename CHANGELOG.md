# Changelog

All notable changes to the Bhoomisetu project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2024-01-09

### Added

#### Module 12: Admin Panel (COMPLETE)

**Backend:**
- Complete admin panel with 22 API endpoints
- User management (list, view, update, suspend, activate, delete, role management)
- Property approvals (list pending, approve, reject - admin override)
- CS activity logs (mediation actions, verification logs)
- Payment reports (transactions, revenue, fraud reports, summary statistics)
- AI performance metrics (fraud detection, sentiment analysis, fake review detection)
- Admin dashboard (comprehensive statistics overview)
- Review moderation (flagged reviews, approve, reject, hide, reports)

**User Management:**
- List all users with filters (search, status, role, fraud score range, pagination, sorting)
- Get user by ID with roles and relations
- Update user (name, status, roles, fraud score)
- Suspend user account (with reason)
- Activate suspended user account
- Delete user (soft delete, prevents self-deletion)
- Role management (assign/remove roles)

**Property Approvals:**
- List all pending properties (admin can see all)
- Approve property (admin override, bypasses CS workflow)
- Reject property (admin override, with reason)

**CS Activity Logs:**
- Get all CS mediation activity logs (paginated, filterable by CS agent)
- Get all CS property verification logs (paginated, filterable by CS agent)
- Relations loaded (CS agent, interest expression, property)

**Payment Reports:**
- Get payment reports with filters (date range, status, gateway, fraud detected)
- Summary statistics (total amount, completed count, failed count, total count)
- Pagination support

**AI Performance Metrics:**
- Get fraud detection metrics (total, average score, high/medium/low risk counts, blocked count)
- Get sentiment analysis metrics (total, average score, positive/negative/neutral/mixed counts)
- Get fake review detection metrics (total, average score, flagged count, reasons breakdown)
- Date range filtering (startDate, endDate)
- Metric type filtering (fraud_detection, sentiment_analysis, fake_review_detection)

**Admin Dashboard:**
- Comprehensive statistics overview (users, properties, CS, payments, AI, reviews, buyer requirements)
- User statistics (total, active, suspended, new today/week/month)
- Property statistics (total, live, pending verification, rejected, featured)
- CS activity statistics (total actions, today's actions, pending/completed mediations)
- Payment statistics (total revenue, revenue today/week/month, active subscriptions, failed payments, fraudulent payments)
- AI performance statistics (fraud checks, sentiment analysis, fake review detections)
- Review statistics (total, approved, flagged, average rating)
- Buyer requirements statistics (total, active, total matches)

**Review Moderation:**
- Get flagged reviews for moderation (paginated, with relations)
- Approve flagged review (with moderation notes)
- Reject flagged review (with reason)
- Hide review (with reason)
- Get all review reports (paginated, filterable by status)

**Database:**
- No new tables created - Admin panel uses existing tables (users, properties, payments, reviews, etc.)
- Admin actions tracked with adminId in logs (audit trail ready)

**API Endpoints (All require Admin role):**
- ✅ `GET /api/admin/dashboard/stats` - Get dashboard statistics
- ✅ `GET /api/admin/users` - Get all users with filters
- ✅ `GET /api/admin/users/:id` - Get user by ID
- ✅ `PATCH /api/admin/users/:id` - Update user
- ✅ `POST /api/admin/users/:id/suspend` - Suspend user
- ✅ `POST /api/admin/users/:id/activate` - Activate user
- ✅ `DELETE /api/admin/users/:id` - Delete user (soft delete)
- ✅ `GET /api/admin/properties/pending` - Get pending properties
- ✅ `POST /api/admin/properties/:id/approve` - Approve property
- ✅ `POST /api/admin/properties/:id/reject` - Reject property
- ✅ `GET /api/admin/cs/activity-logs` - Get CS activity logs
- ✅ `GET /api/admin/cs/verification-logs` - Get CS verification logs
- ✅ `GET /api/admin/payments/reports` - Get payment reports
- ✅ `GET /api/admin/ai/metrics` - Get AI performance metrics
- ✅ `GET /api/admin/reviews/flagged` - Get flagged reviews
- ✅ `POST /api/admin/reviews/:id/approve` - Approve flagged review
- ✅ `POST /api/admin/reviews/:id/reject` - Reject flagged review
- ✅ `POST /api/admin/reviews/:id/hide` - Hide review
- ✅ `GET /api/admin/reviews/reports` - Get review reports

**Integration:**
- ✅ Works with Users module - User management, role management, statistics
- ✅ Works with Properties module - Property approvals (admin override), statistics
- ✅ Works with Customer Service module - CS activity logs, verification logs
- ✅ Works with Payments module - Payment reports, revenue statistics, fraud reports
- ✅ Works with Reviews module - Review moderation, review reports, statistics
- ✅ Works with AI module - AI performance metrics, statistics
- ✅ Works with Mediation module - CS activity logs, mediation statistics
- ✅ Works with Buyer Requirements module - Buyer requirements statistics

**Critical Rules Enforced:**
- Admin-only access (all endpoints require admin role)
- Self-deletion prevention (admin cannot delete their own account)
- Role management (admin can assign/remove roles from users)
- Property approval override (admin can approve/reject properties bypassing CS workflow)
- Audit logging (all sensitive admin actions are logged)
- Data privacy (admin can view all data but actions are logged for audit)
- Review moderation (admin can moderate flagged reviews)
- Report management (admin can view and manage all review reports)

**Documentation:**
- Module 12 implementation summary
- Module 12 testing summary
- Admin API endpoints documented

---

## [0.9.0] - 2024-01-09

### Added

#### Module 11: Reviews & Feedback (COMPLETE)

**Backend:**
- Complete review system with ratings, comments, pros, cons
- AI sentiment analysis integration (automatic for all reviews)
- AI fake review detection integration (automatic for all reviews)
- Review moderation (auto-approval for verified purchases, manual review for flagged reviews)
- Helpful votes (users can vote if reviews are helpful)
- Review reports (users can report inappropriate reviews)
- Seller/Agent replies (with moderation support)

**Reviews:**
- Create review after verified viewing/deal (via interest expression or chat session)
- Update review before moderation
- List reviews with filters (reviewer, reviewee, property, type, context, status, rating range, search)
- Get single review by ID
- Vote on review helpfulness
- Report review as fake/spam/inappropriate/etc.
- Create reply to review (seller/agent only)

**AI Integration:**
- Sentiment analysis endpoint (`POST /reviews/sentiment-analysis`)
- Fake review detection endpoint (`POST /reviews/detect-fake`)
- Automatic analysis on review creation/update
- Graceful degradation if AI service unavailable

**Database:**
- `reviews` table with AI analysis fields (sentiment score, fake review score, fake review reasons)
- `review_helpful_votes` table for helpful vote tracking
- `review_reports` table for review reports
- `review_replies` table for seller/agent replies

**API Endpoints:**
- `POST /api/reviews` - Create review (authenticated, Buyer role)
- `GET /api/reviews` - Get all reviews with filters (public)
- `GET /api/reviews/:id` - Get single review (public)
- `PATCH /api/reviews/:id` - Update review (authenticated, Buyer role, owner only)
- `POST /api/reviews/:id/helpful` - Vote helpful (authenticated)
- `POST /api/reviews/:id/report` - Report review (authenticated)
- `POST /api/reviews/:id/reply` - Create reply (authenticated, Seller/Agent role)
- `GET /api/reviews/property/:propertyId` - Get reviews for property (public)
- `GET /api/reviews/seller/:revieweeId` - Get reviews for seller/agent (public)

**Integration:**
- Works with Properties module - Reviews linked to properties, only LIVE properties can be reviewed
- Works with Mediation module - Reviews linked to interest expressions/chat sessions for verified purchases
- Works with Users module - Reviews linked to reviewer and reviewee, anonymous review support
- Works with Notifications module - Reviewee notified about new reviews, reviewer notified about replies
- Works with AI service - Sentiment analysis and fake review detection for all reviews

**Critical Rules Enforced:**
- Verified purchase only (reviews can only be created after verified viewing/deal)
- Self-review prevention (users cannot review themselves)
- Duplicate review prevention (one review per reviewer-reviewee-property combination)
- Property status check (only LIVE properties can be reviewed)
- Auto-moderation (fake reviews auto-flagged, verified purchases with low fake score auto-approved)
- Privacy (anonymous reviews hide reviewer name)
- Access control (only APPROVED reviews visible to non-owners)
- Report threshold (reviews with 3+ reports auto-flagged)
- Reply restriction (only reviewee can reply)
- Vote restriction (users cannot vote on their own reviews)

**Documentation:**
- Module 11 implementation summary
- Module 11 testing summary
- AI microservice contract updated with sentiment analysis and fake review detection endpoints

---

## [0.1.0] - 2024-01-09

### Added

#### Module 1: Authentication & Roles (COMPLETE)

**Backend:**
- JWT authentication with access/refresh token mechanism
- Role-based access control (RBAC) with guards and decorators
- TypeORM integration with PostgreSQL
- User management service with CRUD operations
- Session management with login tracking
- AI service integration module

**Authentication:**
- OTP request/verification endpoints (structure ready)
- Social login endpoints (Google, Facebook, Apple)
- Token refresh mechanism
- Current user profile endpoint

**Security:**
- AI-powered fraud detection integration
- AI-powered duplicate account detection
- AI-powered session risk assessment
- Request metadata extraction (IP, user-agent, device)

**Database:**
- Complete auth schema with migrations
- Users table with fraud risk scoring
- Roles and user_roles tables
- Login sessions table with risk tracking
- OTP logs table with fraud metadata

**Modules:**
- `auth` module - Authentication & authorization
- `users` module - User management
- `ai` module - AI service integration
- `database` module - TypeORM configuration

**Documentation:**
- Authentication setup guide
- Database setup guide
- AI microservice contract specification
- AI integration summary
- Development roadmap

### Infrastructure

- NestJS project structure
- TypeORM with PostgreSQL
- Environment variable configuration
- Database migration system
- Error handling and logging

### Configuration

- JWT secret and expiration configuration
- Database connection configuration
- AI service URL and API key configuration
- Development/production environment setup

## [0.2.0] - 2024-01-09

### Added

#### Module 2: Landing / Home

**Properties Management:**
- Complete property CRUD operations
- Property listing with advanced filtering
- Featured and new properties endpoints
- Property workflow (draft → verification → live)
- Property images and features management
- Premium subscription tracking

**Home & Subscriptions:**
- Home aggregation endpoint
- Subscription status check
- Premium features access control

#### Module 3: AI Powered Property Search

**AI Search Service:**
- Natural language property search
- 5-step AI ranking algorithm
- Location normalization with Google Maps Geocoding
- AI-powered relevance, urgency, and popularity scoring
- Similar properties matching (±10% price)
- AI tags extraction (Beach, Waterfront, etc.)

**Search Features:**
- Multiple ranking options (relevance, price, popularity, urgency, newest)
- Location-based search with radius filtering
- Comprehensive filtering (type, price, area, bedrooms, bathrooms)
- Pagination and sorting
- Search suggestions endpoint

**API Endpoints:**
- `GET /api/search` - AI-powered property search
- `GET /api/search/properties` - Search alias
- `GET /api/search/suggestions` - Search suggestions

**Database:**
- Properties table with full schema
- Property images table
- Property features table
- Subscriptions table
- Property verification notes table

### Infrastructure

- Google Maps Geocoding API integration
- Enhanced AI microservice contract with search ranking endpoint
- Validation pipes for request validation
- Improved error handling and fallback mechanisms

### Configuration

- Google Maps API key configuration
- Enhanced environment variable setup

## [Unreleased]

## [0.8.0] - 2026-01-10

### Added - Module 10: Payments & Subscriptions

#### Payment Processing
- Payment order creation for Razorpay and Stripe (structure ready for SDK integration)
- Payment verification with gateway signature validation
- Payment webhook processing for gateway events
- Refund processing (structure ready for gateway integration)
- Payment method management (save cards, set default, AI checks)

#### Subscription Management
- Subscription plans (9 plans seeded: Premium Seller/Buyer Monthly/Quarterly/Annual, Featured Listing)
- Subscription purchase and activation
- Subscription extension (existing subscriptions extended when purchasing same type)
- Subscription cancellation with reason tracking
- Auto-renewal support (enable/disable, next billing date calculation)
- Subscription expiry detection and cleanup

#### AI Fraud Checks
- Fraud risk scoring for all payments (0-100, blocks if > 70)
- Duplicate card detection (flags same card across multiple accounts)
- Location mismatch detection (billing address vs user location)
- AI check results stored in payment records for audit

#### Premium Features Integration
- **Priority Listing** (Properties Module): Premium seller properties automatically marked with `isPremium = true`, sorted first in search results
- **Faster Mediation** (Mediation Module): Premium buyers/sellers get `HIGH` priority when expressing interest
- **Featured Badge** (Properties Module): Purchased via subscription, property marked as `isFeatured = true` until expiration

#### Database Schema
- `subscription_plans` table (9 plans seeded)
- `payment_methods` table (saved cards with AI flags)
- `payments` table (all transactions with AI check results)
- `subscription_transactions` table (links payments to subscriptions)
- `payment_webhooks` table (webhook event storage)
- Enhanced `subscriptions` table (plan reference, auto-renewal, cancellation)

#### API Endpoints
- 14 new endpoints (9 payment, 5 subscription)
- Payment order creation, verification, webhook processing, refunds
- Subscription status, features, cancellation, auto-renewal

#### Integration
- Integrated with Properties module for priority listing and featured badge
- Integrated with Mediation module for faster mediation (HIGH priority)
- Integrated with Notifications module for subscription and payment notifications
- Integrated with AI service for fraud detection and risk scoring

### Enhanced - Modules 8 & 9 (Review & Enhancements)

#### Module 8: AI Chat Support
- ✅ FAQ integration in chat responses (automatic FAQ context enrichment)
- ✅ Property suggestions from database (real property search based on extracted criteria)
- ✅ Requirement update detection (intent detection for requirement updates)

#### Module 9: Notifications
- ✅ Enhanced SMS notification structure (ready for Twilio/AWS SNS integration)
- ✅ Enhanced Email notification structure (ready for SendGrid/AWS SES integration)
- ✅ Clear integration examples with TODO markers for production

## [0.6.0] - 2025-01-09

### Added - Module 9: Notifications
- ✅ Multi-channel notification system (Push via Firebase FCM, SMS, Email)
- ✅ User notification preferences (per-channel, per-type, quiet hours)
- ✅ Delivery tracking with detailed logs
- ✅ Automatic retry logic for failed deliveries
- ✅ Notification expiration and cleanup
- ✅ Database tables: `notification_preferences`, `notifications`, `notification_delivery_logs`, `notification_templates`
- ✅ API endpoints: `/api/notifications`, `/api/notifications/preferences`, `/api/notifications/fcm-token`
- ✅ Firebase FCM integration for push notifications
- ✅ Notification triggers integrated into Modules 5, 6, 7, 8:
  - Property match notifications (buyer, seller, CS)
  - Interest expression notifications (seller - CRITICAL: buyer contact hidden)
  - Mediation update notifications (buyer, seller)
  - AI chat escalation notifications (CS agents)
  - CS follow-up notifications
- ✅ Contact hiding enforcement (CRITICAL: buyer/seller contact never revealed in notifications)
- ✅ CS agent finding and notification (`UsersService.findByRole()`)

### Changed
- ✅ Updated `FirebaseService` with `sendPushNotification()` and `sendMulticastPushNotification()` methods
- ✅ Integrated notification triggers into existing modules (5, 6, 7, 8)
- ✅ Replaced all TODO notification comments with actual notification calls

## [0.5.0] - 2025-01-09

### Added - Module 8: AI Chat Support (24/7)
- ✅ 24/7 AI chat support with bilingual support (English + Telugu)
- ✅ FAQ handling with knowledge base (bilingual)
- ✅ Property suggestions based on user queries
- ✅ Requirement updates assistance
- ✅ Appointment booking assistance (escalates to CS)
- ✅ Intent detection (FAQ, property search, serious intent, appointment, requirement update, complaint)
- ✅ Automatic escalation workflow (serious intent → CS)
- ✅ Conversation history tracking
- ✅ Context-aware conversations (property-specific, requirement-specific)
- ✅ AI prompt rules enforcement (never share seller contact, always escalate serious intent)
- ✅ Fallback responses when AI service unavailable
- ✅ Database tables: `ai_chat_conversations`, `ai_chat_messages`, `ai_chat_actions`, `ai_chat_faqs`
- ✅ API endpoints: `/api/ai-chat/message`, `/api/ai-chat/conversations`, `/api/ai-chat/faqs`
- ✅ Integration with AI microservice (`/chat/completion` endpoint)
- ✅ Integration with Properties, Buyer Requirements, and Customer Service modules

### Changed
- ✅ Updated `tsconfig.json` to disable `strictPropertyInitialization` for TypeORM entities
- ✅ Extended `AiService` with `chatCompletion()` method for LLM integration

## [Unreleased]

### Planned

- Firebase Admin SDK integration for OTP
- Passkey/WebAuthn authentication endpoints
- Admin user/role management endpoints
- Module 5: Customer Service Verification
- Module 6: Buyer Requirement Posting
- Module 7: Mediation & Negotiation
- Module 8: AI Chat Support