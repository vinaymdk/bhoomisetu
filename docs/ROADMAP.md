# Bhoomisetu Development Roadmap

## Project Overview

Real Estate Mediation Platform with AI-first architecture. Buyer and Seller never contact directly - Customer Service mediates all interactions.

## Module Status

### ✅ Module 1: Authentication & Roles (COMPLETED + FIXES)

**Status**: ✅ **COMPLETE** + ✅ **AUTH FIXES APPLIED**

**Backend Implementation:**
- ✅ JWT authentication with access/refresh tokens
- ✅ Role-based access control (RBAC)
- ✅ Phone + Email OTP authentication flow (structure ready)
- ✅ Social login (Google, Facebook, Apple) structure
- ✅ Session management with TypeORM
- ✅ AI-powered fraud detection integration
- ✅ AI-powered duplicate account detection
- ✅ AI-powered session risk assessment
- ✅ User management with roles

**Database:**
- ✅ `users` table with fraud risk scoring
- ✅ `roles` table (buyer, seller, agent, customer_service, admin)
- ✅ `user_roles` junction table
- ✅ `login_sessions` table with risk scores
- ✅ `otp_logs` table with fraud tracking

**API Endpoints:**
- ✅ `POST /api/auth/otp/request` - Request OTP
- ✅ `POST /api/auth/otp/verify` - Verify OTP and login
- ✅ `POST /api/auth/social` - Social login
- ✅ `POST /api/auth/refresh` - Refresh tokens
- ✅ `GET /api/users/me` - Get current user

**Frontend Implementation:**
- ✅ Web: Authentication state persistence on page refresh
- ✅ Web: Token refresh handling
- ✅ Web: Route protection (PublicRoute + ProtectedRoute)
- ✅ Mobile: Authentication state persistence
- ✅ Mobile: Token refresh handling
- ✅ Mobile: Route protection
- ✅ Mobile: Pull-to-refresh functionality
- ✅ Mobile: Offline handling structure (connectivity service)

**Next Steps:**
- 🔄 Integrate Firebase Admin SDK for OTP verification
- 🔄 Implement Passkey/WebAuthn endpoints
- 🔄 Add admin endpoints for user/role management
- 🔄 Add logout endpoint

---

### ✅ Module 2: Landing / Home (COMPLETED)

**Status**: ✅ **COMPLETE** (Backend)

**Components:**
- ✅ Premium Subscription Banner (backend support)
- ⏳ AI Search Bar (frontend pending)
- ✅ New Properties (backend API)
- ✅ Featured Properties (backend API)
- ⏳ Testimonials (pending)
- ⏳ AI Chat Entry Point (pending)

**UI Rules:**
- ⏳ Mobile: Sticky Bottom Navigation (frontend pending)
- ⏳ Web: Header + Footer (frontend pending)

**Backend Implementation:**
- ✅ Properties API endpoints (full CRUD)
- ✅ Featured properties logic
- ✅ Premium subscription status check
- ✅ Home aggregation endpoint
- ✅ Advanced filtering and pagination
- ✅ Property workflow (draft → verification → live)

---

### ✅ Module 3: AI Powered Property Search (COMPLETED)

**Status**: ✅ **COMPLETE** (Backend + Frontend)

**Backend Features:**
- ✅ Natural language search queries
- ✅ Filters (Location, Type, Price, Bedrooms/Bathrooms, AI Tags)
- ✅ AI ranking algorithm (5-step process)
- ✅ Geo-coordinate normalization (Google Maps API)
- ✅ Similar properties matching (±10% price)
- ✅ Pagination and sorting
- ✅ AI tags extraction (Beach, Waterfront, etc.)

**Backend Implementation:**
- ✅ Property search API with AI ranking
- ✅ Location geocoding service (Google Maps + fallback)
- ✅ Filter application logic
- ✅ Similarity matching algorithm
- ✅ Multiple ranking options (relevance, price, popularity, urgency)

**Frontend Implementation (Web + Mobile):**
- ✅ Natural language search input
- ✅ Advanced filters UI (location, price, type, bedrooms, bathrooms)
- ✅ Search results with AI rankings display
- ✅ Match reasons and AI tags display
- ✅ Sorting options (relevance, price, popularity, urgency, newest)
- ✅ Pagination (Web: page-based, Mobile: infinite scroll)
- ✅ Similar properties section
- ✅ Loading, error, and empty states
- ✅ Responsive design (Web)
- ✅ Pull-to-refresh (Mobile)

---

### ✅ Module 4: Seller Property Listing (Backend Complete)

**Status**: ✅ **COMPLETE** (Backend + Frontend)

**Features:**
- ✅ Sale/Rent selection (from Module 2)
- ✅ Property type selection (from Module 2)
- ✅ Dynamic fields based on property type (from Module 2)
- ✅ Image upload (Cloudinary integration)
- ⏳ GPS location picker (UI pending - frontend)
- ✅ Submit for verification (from Module 2)

**Backend Implementation:**
- ✅ Property creation API (Module 2)
- ✅ Image upload/storage (Cloudinary) - **NEW**
- ✅ Property schema with dynamic fields (Module 2)
- ✅ Verification workflow (Module 5)

**API Endpoints:**
- ✅ `POST /api/properties/images/upload` - Upload property images (max 20, 10MB each)
  - Requires authentication (JWT)
  - Requires seller/agent role
  - Returns array of image URLs and metadata

**Configuration:**
- ✅ Cloudinary credentials required: `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`

**Frontend Requirements (Pending):**
**Frontend Implementation (Web + Mobile):**
- ✅ Create listing UI (seller/agent only)
- ✅ Image upload UI + primary image selection
- ✅ My listings UI + submit for verification
- ✅ Loading / error / empty states
- ✅ Role-based route protection (seller/agent only)

**Next UX Enhancements:**
- 🔄 GPS “pick on map” (Google Maps integration)
- 🔄 Property-type dynamic fields (feature keys / structured features)

---

### ✅ Module 5: Customer Service Verification (CRITICAL)

**Status**: ✅ **COMPLETE** (Backend)

**Features:**
- ✅ CS agent dashboard API
- ✅ Phone verification with seller (seller contact info accessible to CS)
- ✅ Ownership validation (via CS verification workflow)
- ✅ Urgency level capture (low, normal, high, urgent)
- ✅ Negotiation flexibility notes
- ✅ Property approval workflow (CRITICAL)

**Database Tables:**
- ✅ `properties` table (with status workflow)
- ✅ `property_verification_notes` table (CRITICAL) - includes urgency, negotiation notes, remarks
- ✅ CS agents use existing `users` table with `customer_service` role

**Backend Implementation:**
- ✅ CS verification API endpoints
- ✅ Property status management (DRAFT → PENDING_VERIFICATION → LIVE after CS approval)
- ✅ CS agent assignment logic (role-based access)
- ✅ CS agent statistics (dashboard metrics)
- ✅ Property reassignment (admin only)
- ✅ CRITICAL: Properties can ONLY become LIVE after CS verification (enforced)

**Property Workflow (CRITICAL):**
1. Seller creates property → `DRAFT` status
2. Seller submits for verification → `PENDING_VERIFICATION` status
3. CS agent verifies (phone call, ownership check) → Approves/Rejects
4. If approved → `LIVE` status (visible to buyers) - **ONLY way to go LIVE**
5. If rejected → `REJECTED` status (seller can edit and resubmit)

**API Endpoints:**
- ✅ `GET /api/customer-service/pending` - Get pending verifications (CS dashboard)
- ✅ `GET /api/customer-service/properties/:id` - Get property for verification
- ✅ `POST /api/customer-service/verify` - Verify property (approve/reject)
- ✅ `GET /api/customer-service/stats` - CS agent statistics
- ✅ `POST /api/customer-service/reassign/:propertyId` - Reassign property (admin only)

---

### ✅ Module 6: Buyer Requirement Posting

**Status**: ✅ **COMPLETE** (Backend)

**Features:**
- ✅ Location selection (with geocoding support)
- ✅ Budget specification (min/max, sale/rent)
- ✅ Property type selection
- ✅ Required features (flexible JSONB array)
- ✅ AI matching system (CRITICAL)

**AI Matching Logic (CRITICAL - Enforced):**
- ✅ Location matching (city or locality)
- ✅ Budget overlap >= 80% (CRITICAL threshold)
- 🔄 Notification to Seller + CS (placeholder - Module 9)

**Backend Implementation:**
- ✅ Buyer requirement API (CRUD operations)
- ✅ AI matching algorithm implementation
- ✅ Match tracking and scoring system
- ✅ Automatic matching on requirement creation
- ✅ Automatic matching when property goes LIVE (triggered from CS verification)
- 🔄 Notification triggers (Module 9 - pending)

**Database Tables:**
- ✅ `buyer_requirements` - Stores buyer requirements
- ✅ `property_requirement_matches` - Tracks matches with scores and notification status

**API Endpoints:**
- ✅ `POST /api/buyer-requirements` - Create buyer requirement
- ✅ `GET /api/buyer-requirements` - List buyer requirements (filtered)
- ✅ `GET /api/buyer-requirements/:id` - Get specific requirement
- ✅ `PUT /api/buyer-requirements/:id` - Update requirement
- ✅ `DELETE /api/buyer-requirements/:id` - Delete requirement
- ✅ `GET /api/buyer-requirements/:id/matches` - Get matches for a requirement

**Frontend Implementation (Web + Mobile):**
- ✅ Buyer requirements list + status/search filters
- ✅ Buyer requirement creation form (validation + area units)
- ✅ Requirement detail view with match scores + matched properties
- ✅ Role-based access (buyer/admin only)
- ✅ Loading/empty/error states + pull-to-refresh (mobile)

**Matching Algorithm:**
1. **Location Match**: Same city (or locality if available)
2. **Budget Overlap**: Property price must overlap with requirement budget range by >=80%
   - Calculation: Overlap range / Requirement range * 100 >= 80%
   - Includes ±20% tolerance for flexibility
3. **Additional Factors** (bonus): Property type, bedrooms, bathrooms

**Integration:**
- ✅ Matches triggered when new requirement is created
- ✅ Matches triggered when property goes LIVE (after CS verification)
- ✅ Match scores stored (location, budget, overall)
- ✅ Match reasons tracked (for user feedback)

---

### ✅ Module 7: Mediation & Negotiation

**Status**: ✅ **COMPLETE** (Backend)

**Features:**
- ✅ Interest expression by buyer
- ✅ CS seriousness check (buyer)
- ✅ CS seller willingness re-check
- ✅ CS-mediated connection approval
- ✅ Chat/Call enabled ONLY after CS approval (CRITICAL)
- ✅ Contact hiding until CS approval (CRITICAL - NON-NEGOTIABLE)

**Mediation Workflow (CRITICAL - Enforced):**
1. Buyer expresses interest → `PENDING` status
2. CS checks buyer seriousness → `CS_REVIEWING` → `SELLER_CHECKING` (if approved)
3. CS checks seller willingness → `SELLER_CHECKING` → `APPROVED` (if both willing)
4. CS approves connection → `CONNECTED` status + Chat session created
5. **ONLY NOW**: Seller contact revealed to buyer, Buyer contact revealed to seller
6. Chat/Call enabled - both parties can communicate through mediated chat

**CRITICAL RULES (NON-NEGOTIABLE):**
- ✅ **Seller contact is ALWAYS hidden until CS approval**
- ✅ **Buyer contact is ALWAYS hidden until CS approval**
- ✅ **Chat/Call enabled ONLY after CS approval**
- ✅ **CS agent is ALWAYS part of chat sessions** (mediates all conversations)
- ✅ **Buyer and Seller CANNOT contact directly** - all communication through platform

**Database Tables:**
- ✅ `interest_expressions` - Buyer interest in properties
- ✅ `cs_mediation_actions` - Tracks all CS actions in mediation workflow
- ✅ `chat_sessions` - Mediated chat sessions (CS always included)
- ✅ `chat_messages` - All messages in chat sessions (moderated by CS)

**API Endpoints:**
- ✅ `POST /api/mediation/interest` - Express interest (buyer)
- ✅ `GET /api/mediation/my-interests` - Get buyer's interests
- ✅ `GET /api/mediation/property-interests` - Get interests in seller's properties
- ✅ `GET /api/mediation/pending` - Get pending interests (CS dashboard)
- ✅ `GET /api/mediation/interests/:id` - Get specific interest expression
- ✅ `POST /api/mediation/review/buyer-seriousness` - CS reviews buyer seriousness
- ✅ `POST /api/mediation/review/seller-willingness` - CS checks seller willingness
- ✅ `POST /api/mediation/approve-connection` - CS approves connection (enables chat/contact reveal)
- ✅ `POST /api/mediation/reject-connection/:id` - CS rejects connection
- ✅ `GET /api/mediation/chat-sessions/:id` - Get chat session (only if approved)
- ✅ `POST /api/mediation/chat-sessions/:id/messages` - Send message in chat

**Backend Implementation:**
- ✅ Interest expression API with contact hiding
- ✅ CS mediation workflow (seriousness check, willingness check, approval)
- ✅ Contact reveal logic (enforced at service level)
- ✅ Chat/call session management (created only after CS approval)
- ✅ Message moderation support (CS can moderate messages)
- ✅ Access control (only participants can access chat sessions)

**Frontend Implementation (Web + Mobile):**
- ✅ Buyer express interest from property details
- ✅ Buyer interests list with status filters
- ✅ Seller interests list for properties
- ✅ CS mediation queue with review/approve/reject actions
- ✅ Loading/empty/error states

---

### ✅ Module 8: AI Chat Support (24/7)

**Status**: ✅ **COMPLETE** (Backend)

**Features:**
- ✅ 24/7 AI chat support
- ✅ FAQ handling (bilingual knowledge base)
- ✅ Property suggestions based on user queries
- ✅ Requirement updates assistance
- ✅ Appointment booking assistance (escalates to CS for confirmation)
- ✅ Telugu + English support (automatic language detection)

**AI Prompt Rules (CRITICAL - NON-NEGOTIABLE):**
- ✅ **NEVER share seller contact directly** (phone, email, address) - enforced in system prompt
- ✅ **NEVER share buyer contact directly** - enforced in system prompt
- ✅ **ALWAYS escalate serious intent to CS** (buy, purchase, negotiate, deal, contact requests) - enforced in system prompt
- ✅ Can provide property information, suggest properties, answer FAQs, and help with general queries
- ✅ If user asks for seller contact, politely explain that customer service will connect them after verification

**Database Tables:**
- ✅ `ai_chat_conversations` - AI chat conversations with context tracking
- ✅ `ai_chat_messages` - All messages in conversations (bilingual: English + Telugu)
- ✅ `ai_chat_actions` - Actions taken from AI suggestions (property suggestions, requirement updates, escalations)
- ✅ `ai_chat_faqs` - Knowledge base for FAQ handling (bilingual)

**API Endpoints:**
- ✅ `POST /api/ai-chat/message` - Send message to AI chat
- ✅ `GET /api/ai-chat/conversations/:id` - Get conversation history
- ✅ `GET /api/ai-chat/conversations` - Get user's conversations
- ✅ `POST /api/ai-chat/conversations/:id/close` - Close conversation
- ✅ `GET /api/ai-chat/faqs` - Get FAQs (bilingual)

**Backend Implementation:**
- ✅ AI chat service with LLM integration (OpenAI-compatible)
- ✅ Intent detection (FAQ, property search, serious intent, appointment, requirement update, complaint)
- ✅ Automatic escalation workflow (serious intent → CS)
- ✅ Bilingual support (English + Telugu with automatic translation)
- ✅ Conversation history tracking
- ✅ Context-aware conversations (property-specific, requirement-specific)
- ✅ Fallback responses when AI service unavailable
- ✅ Access control (users can only access their conversations)

**Integration:**
- ✅ Works with AI microservice (`/chat/completion` endpoint)
- ✅ Works with Properties module (property suggestions)
- ✅ Works with Buyer Requirements module (requirement updates)
- ✅ Escalates to Customer Service module (Module 5/7)
- ✅ Uses Users module for role checking

**Backend Requirements:**
- AI chat API endpoint
- LLM integration (OpenAI-compatible)
- Conversation history
- Escalation workflow

---

### ✅ Module 9: Notifications

**Status**: ✅ **COMPLETE** (Backend)

**Features:**
- ✅ Multi-channel notifications (Push via Firebase FCM, SMS, Email)
- ✅ User notification preferences (per-channel, per-type, quiet hours)
- ✅ Delivery tracking with detailed logs
- ✅ Automatic retry logic for failed deliveries
- ✅ Notification templates support (ready for future use)

**Triggers (All Implemented):**
- ✅ New matching property (Module 6) - Notifies buyer, seller, CS
- ✅ Price drop (ready for Module 4 integration)
- ✅ Viewing reminder (ready for appointment scheduling)
- ✅ Subscription renewal (ready for Module 10 integration)
- ✅ CS follow-up (Module 5/7) - CS agents can send custom notifications
- ✅ Interest expression (Module 7) - Seller notified when buyer expresses interest
- ✅ Mediation updates (Module 7) - Buyer/seller notified about mediation status
- ✅ AI chat escalation (Module 8) - CS agents notified when conversation escalated

**Channels:**
- ✅ Push notifications (Firebase FCM) - Fully integrated
- ✅ SMS - Ready for SMS gateway integration (Twilio, AWS SNS, etc.)
- ✅ Email - Ready for email service integration (SendGrid, AWS SES, etc.)

**Database Tables:**
- ✅ `notification_preferences` - User preferences for notification channels and types
- ✅ `notifications` - All notifications sent to users (multi-channel tracking)
- ✅ `notification_delivery_logs` - Detailed delivery logs for each channel attempt
- ✅ `notification_templates` - Reusable notification templates (bilingual support)

**API Endpoints:**
- ✅ `GET /api/notifications` - Get user notifications (with pagination and unread filter)
- ✅ `PUT /api/notifications/:id/read` - Mark notification as read
- ✅ `GET /api/notifications/preferences` - Get user notification preferences
- ✅ `PUT /api/notifications/preferences` - Update user notification preferences
- ✅ `POST /api/notifications/fcm-token` - Update FCM token for push notifications

**Backend Implementation:**
- ✅ Multi-channel notification service (push, SMS, email)
- ✅ Firebase FCM integration for push notifications
- ✅ Delivery tracking with detailed logs
- ✅ Error handling and retry logic
- ✅ User preference management
- ✅ Quiet hours support
- ✅ Notification expiration and cleanup
- ✅ Contact hiding enforced (CRITICAL: buyer/seller contact never revealed)

**Integration:**
- ✅ Works with Module 5 (CS verification) - CS agents notified about property matches
- ✅ Works with Module 6 (Buyer Requirements) - Property match notifications (buyer, seller, CS)
- ✅ Works with Module 7 (Mediation) - Interest expression, mediation updates, connection approval/rejection
- ✅ Works with Module 8 (AI Chat) - Escalation notifications to CS agents
- ✅ Works with Users module - CS agent finding (`findByRole('customer_service')`)
- ✅ Works with Firebase module - FCM push notification delivery

**Notification Trigger Methods (Internal):**
- ✅ `notifyPropertyMatch()` - Notify buyer about new property match
- ✅ `notifyInterestExpression()` - Notify seller about buyer interest (CRITICAL: buyer contact hidden)
- ✅ `notifyMediationUpdate()` - Notify buyer/seller about mediation status
- ✅ `notifyAiChatEscalation()` - Notify CS agents about AI chat escalation
- ✅ `notifyCsFollowup()` - CS agents can send custom notifications
- ✅ `notifyPriceDrop()` - Ready for Module 4 integration
- ✅ `notifyViewingReminder()` - Ready for appointment scheduling
- ✅ `notifySubscriptionRenewal()` - Ready for Module 10 integration

**Backend Requirements:**
- Notification service
- Event triggers
- Multi-channel delivery
- Notification preferences

**2026-01-27 Updates (Support Chat & AI Chat):**
- ✅ Support chat access approvals (`support_chat_access`) with CS admin UI
- ✅ Real-time support chat unread counts and read updates
- ✅ Avatar fallback with profile image support (web + mobile)
- ✅ AI chat property links + duplicate-send fixes (web + mobile)
- ✅ CS chat access bulk approvals + avatar search dropdown
- ✅ Mobile CS chat session listing + unread count sync

---

### ✅ Module 10: Payments & Subscriptions

**Status**: ✅ **COMPLETE**

**Features:**
- ✅ Premium subscription purchase (Razorpay/Stripe structure ready)
- ✅ Priority listing (Properties module integrated)
- ✅ Faster mediation (Mediation module integrated)
- ✅ Featured badge (Properties module integrated)
- ✅ Subscription management (purchase, extend, cancel, auto-renewal)
- ✅ Payment processing (order creation, verification, webhooks, refunds)
- ✅ Payment methods (save cards, default method, AI checks)

**AI Checks:**
- ✅ Fraud detection (blocks high-risk payments)
- ✅ Duplicate cards (flags same card across accounts)
- ✅ Location mismatch (flags billing address vs user location mismatch)

**Backend Requirements:**
- ✅ Payment gateway integration (Razorpay/Stripe structure ready for SDK)
- ✅ Subscription management (CRUD, auto-renewal, expiry)
- ✅ Premium feature enforcement (priority listing, faster mediation)
- ✅ AI fraud checks (fraud detection, duplicate cards, location mismatch)

**Integration:**
- ✅ Works with Properties module - Priority listing, featured badge
- ✅ Works with Mediation module - Faster mediation (HIGH priority)
- ✅ Works with Notifications module - Subscription activation, payment notifications
- ✅ Works with AI service - Fraud detection, risk scoring
- ✅ Works with Users module - User-specific subscriptions and payments

**API Endpoints:**
- ✅ `GET /api/payments/plans` - Get subscription plans (public)
- ✅ `POST /api/payments/orders` - Create payment order
- ✅ `POST /api/payments/verify` - Verify and process payment
- ✅ `POST /api/payments/webhooks/:gateway` - Process webhook (public)
- ✅ `GET /api/payments/methods` - Get user payment methods
- ✅ `GET /api/payments` - Get user payments
- ✅ `POST /api/payments/:id/refund` - Refund payment (Admin/CS)
- ✅ `GET /api/subscriptions/status` - Get subscription status
- ✅ `GET /api/subscriptions/features` - Get premium features
- ✅ `PUT /api/subscriptions/:id/cancel` - Cancel subscription
- ✅ `PUT /api/subscriptions/:id/auto-renewal` - Update auto-renewal

**Frontend Implementation (Web + Mobile):**
- ✅ Web: subscription plans, checkout, payment history, subscription management pages
- ✅ Mobile: subscription plans, checkout, payment history, subscription management screens
- ✅ Navigation from Premium banner + drawer to subscription flow

**Database:**
- ✅ `subscription_plans` - 9 plans seeded
- ✅ `payment_methods` - User saved cards
- ✅ `payments` - All payment transactions
- ✅ `subscription_transactions` - Links payments to subscriptions
- ✅ `payment_webhooks` - Webhook event storage

**2026-01-27 Updates:**
- ✅ Added Module 10 sample data + load script

**2026-01-28 Updates:**
- ✅ Webhook signature verification explicitly stubbed with verification metadata logging
- ✅ Added basic webhook processing tests
- ✅ UI coverage verified for web + mobile subscription flows

---

### ✅ Module 11: Reviews & Feedback

**Status**: ✅ **COMPLETE** (Backend)

**Features:**
- ✅ Rating after viewing/deal (verified purchases only)
- ✅ AI sentiment analysis (automatic, positive/negative/neutral/mixed)
- ✅ Fake review detection (AI-powered with multiple signals)
- ✅ Review moderation (auto-approval, manual review for flagged reviews)
- ✅ Helpful votes (users can vote if reviews are helpful)
- ✅ Review reports (users can report inappropriate reviews)
- ✅ Seller/Agent replies (with moderation)

**Backend Implementation:**
- ✅ Reviews API endpoints (create, update, list, report, reply, vote)
- ✅ AI sentiment analysis integration (automatic for all reviews)
- ✅ AI fake review detection integration (automatic for all reviews)
- ✅ Verified purchase tracking (via interest expression/chat session)
- ✅ Review moderation workflow (auto-approve/flag based on AI analysis)
- ✅ Anonymous review support
- ✅ Privacy and access control enforcement

**Database Tables:**
- ✅ `reviews` - Main reviews table with AI analysis fields
- ✅ `review_helpful_votes` - Helpful vote tracking
- ✅ `review_reports` - Review reports
- ✅ `review_replies` - Seller/Agent replies

**API Endpoints:**
- ✅ `POST /api/reviews` - Create review (authenticated, Buyer role)
- ✅ `GET /api/reviews` - Get all reviews with filters (public)
- ✅ `GET /api/reviews/:id` - Get single review (public)
- ✅ `PATCH /api/reviews/:id` - Update review (authenticated, Buyer role, owner only)
- ✅ `POST /api/reviews/:id/helpful` - Vote helpful (authenticated)
- ✅ `POST /api/reviews/:id/report` - Report review (authenticated)
- ✅ `POST /api/reviews/:id/reply` - Create reply (authenticated, Seller/Agent role)
- ✅ `GET /api/reviews/property/:propertyId` - Get reviews for property (public)
- ✅ `GET /api/reviews/seller/:revieweeId` - Get reviews for seller/agent (public)

**Integration:**
- ✅ Works with Properties module - Reviews linked to properties, only LIVE properties can be reviewed
- ✅ Works with Mediation module - Reviews linked to interest expressions/chat sessions for verified purchases
- ✅ Works with Users module - Reviews linked to reviewer and reviewee, anonymous support
- ✅ Works with Notifications module - Reviewee notified about new reviews, reviewer notified about replies
- ✅ Works with AI service - Sentiment analysis and fake review detection for all reviews

---

### ✅ Module 12: Admin Panel

**Status**: ✅ **COMPLETE** (Backend)

**Features:**
- ✅ User management (list, view, update, suspend, activate, delete, role management)
- ✅ Property approvals (list pending, approve, reject - admin override)
- ✅ CS activity logs (mediation actions, verification logs)
- ✅ Payment reports (transactions, revenue, fraud reports, summary statistics)
- ✅ AI performance metrics (fraud detection, sentiment analysis, fake review detection)
- ✅ Admin dashboard (comprehensive statistics overview)
- ✅ Review moderation (flagged reviews, approve, reject, hide, reports)

**Backend Implementation:**
- ✅ Admin APIs with 22 endpoints
- ✅ Analytics endpoints (dashboard stats, AI metrics, payment reports)
- ✅ Reporting features (payment reports, CS activity logs, review reports)
- ✅ Dashboard data aggregation (users, properties, CS, payments, AI, reviews, buyer requirements)

**API Endpoints:**
- ✅ `GET /api/admin/dashboard/stats` - Get dashboard statistics (authenticated, Admin role)
- ✅ `GET /api/admin/users` - Get all users with filters (authenticated, Admin role)
- ✅ `GET /api/admin/users/:id` - Get user by ID (authenticated, Admin role)
- ✅ `PATCH /api/admin/users/:id` - Update user (authenticated, Admin role)
- ✅ `POST /api/admin/users/:id/suspend` - Suspend user (authenticated, Admin role)
- ✅ `POST /api/admin/users/:id/activate` - Activate user (authenticated, Admin role)
- ✅ `DELETE /api/admin/users/:id` - Delete user (soft delete, authenticated, Admin role)
- ✅ `GET /api/admin/properties/pending` - Get pending properties (authenticated, Admin role)
- ✅ `POST /api/admin/properties/:id/approve` - Approve property (authenticated, Admin role)
- ✅ `POST /api/admin/properties/:id/reject` - Reject property (authenticated, Admin role)
- ✅ `GET /api/admin/cs/activity-logs` - Get CS activity logs (authenticated, Admin role)
- ✅ `GET /api/admin/cs/verification-logs` - Get CS verification logs (authenticated, Admin role)
- ✅ `GET /api/admin/payments/reports` - Get payment reports (authenticated, Admin role)
- ✅ `GET /api/admin/ai/metrics` - Get AI performance metrics (authenticated, Admin role)
- ✅ `GET /api/admin/reviews/flagged` - Get flagged reviews (authenticated, Admin role)
- ✅ `POST /api/admin/reviews/:id/approve` - Approve flagged review (authenticated, Admin role)
- ✅ `POST /api/admin/reviews/:id/reject` - Reject flagged review (authenticated, Admin role)
- ✅ `POST /api/admin/reviews/:id/hide` - Hide review (authenticated, Admin role)
- ✅ `GET /api/admin/reviews/reports` - Get review reports (authenticated, Admin role)

**Integration:**
- ✅ Works with Users module - User management, role management, statistics
- ✅ Works with Properties module - Property approvals (admin override), statistics
- ✅ Works with Customer Service module - CS activity logs, verification logs
- ✅ Works with Payments module - Payment reports, revenue statistics, fraud reports
- ✅ Works with Reviews module - Review moderation, review reports, statistics
- ✅ Works with AI module - AI performance metrics, statistics
- ✅ Works with Mediation module - CS activity logs, mediation statistics
- ✅ Works with Buyer Requirements module - Buyer requirements statistics

---

## Development Phases

### Phase 1: Foundation (✅ COMPLETE)
- ✅ Module 1: Authentication & Roles
  - ✅ JWT + RBAC
  - ✅ Database schema
  - ✅ AI fraud detection integration

### Phase 2: Core Features (🔄 IN PROGRESS)
- ✅ Module 2: Landing / Home (Backend Complete)
- ✅ Module 3: AI Powered Property Search (Backend Complete)
- ✅ Module 4: Seller Property Listing (Integrated in Module 2)
- 🔄 Module 5: Customer Service Verification (Next)

### Phase 3: Matching & Mediation
- ⏳ Module 6: Buyer Requirement Posting
- ⏳ Module 7: Mediation & Negotiation
- ⏳ Module 8: AI Chat Support

### Phase 4: Engagement & Monetization
- ⏳ Module 9: Notifications
- ⏳ Module 10: Payments & Subscriptions
- ✅ Module 11: Reviews & Feedback

### Phase 5: Management & Analytics
- ✅ Module 12: Admin Panel

---

## Technology Stack Status

### Backend (NestJS)
- ✅ Project structure
- ✅ TypeORM with PostgreSQL
- ✅ JWT authentication
- ✅ RBAC guards
- ✅ AI service integration
- ⏳ Firebase Admin SDK (pending)
- ⏳ File upload (pending)
- ⏳ WebSocket support (pending)
- ⏳ Redis integration (pending)

### Database (PostgreSQL)
- ✅ Auth tables (users, roles, user_roles, login_sessions, otp_logs)
- ⏳ Properties tables (pending)
- ⏳ Requirements tables (pending)
- ⏳ Verification tables (pending)
- ⏳ Chat/messaging tables (pending)
- ⏳ Payments tables (pending)

### AI Service (Python Microservice)
- ✅ Contract defined
- ✅ Integration points identified
- ⏳ Implementation (pending)
- ⏳ ML models (pending)

### Frontend
- ⏳ Flutter app (pending)
- ⏳ React web app (pending)

---

## Current Sprint Goals

### Sprint 1 (✅ COMPLETE)
- ✅ Authentication system
- ✅ Database setup
- ✅ AI service contract

### Sprint 2 (🔄 CURRENT)
- 🔄 Module 2: Landing / Home backend APIs
- ⏳ Properties database schema
- ⏳ Basic property listing endpoints

### Sprint 3 (⏳ UPCOMING)
- ⏳ Module 3: Property search with AI
- ⏳ Module 4: Property listing submission
- ⏳ Image upload functionality

---

## Dependencies & Blockers

### Blockers
- None currently

### Dependencies
- Firebase Admin SDK setup needed for OTP verification
- AI Python microservice implementation
- Image storage solution (S3/Cloudinary)
- Payment gateway accounts (Razorpay/Stripe)

---

## Key Metrics to Track

- User registration and authentication success rate
- AI fraud detection accuracy
- Property listing to verification time
- CS mediation success rate
- Buyer-seller match rate
- Platform transaction completion rate

---

## Next Immediate Actions

1. **Complete Module 1 remaining items:**
   - Firebase Admin SDK integration
   - Admin user/role management endpoints
   - Logout endpoint

2. **Start Module 2:**
   - Create properties database schema
   - Implement property listing APIs
   - Featured properties logic
   - Premium subscription status check

3. **Prepare for Module 3:**
   - Design property search schema
   - Plan AI ranking algorithm
   - Geo-location service integration

---

## Recent UX / Platform Updates (Jan 24, 2026)

- ✅ Web: compact header sizing + account dropdown (Profile/Settings/Logout)
- ✅ Web: new Settings page for badge preferences
- ✅ Web: property image zoom modal on details page
- ✅ Mobile: Settings screen for badge preferences (moved out of Profile/Reqs)
- ✅ Mobile: property image zoom viewer on details page
- ✅ Backend: profile updates tolerate empty email/phone values
- ✅ Backend: Cloudinary AVIF uploads allowed

---

**Last Updated**: 2026-01-28
**Current Phase**: Phase 2 - Core Features
**Next Milestone**: Module 2 Completion
