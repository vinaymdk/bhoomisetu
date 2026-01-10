# Bhoomisetu - Real Estate Mediation Platform

A comprehensive real estate platform that mediates between buyers and sellers, ensuring zero direct contact and AI-powered customer service.

## 🏗️ Architecture

### Tech Stack

- **Mobile**: Flutter (Android & iOS - Single Codebase)
- **Web**: React (Responsive Web App)
- **Backend**: Node.js with NestJS (Modular Monolith)
- **Database**: PostgreSQL
- **Cache & Realtime**: Redis + WebSockets
- **Auth & Notifications**: Firebase
- **Payments**: Razorpay / Stripe
- **Maps**: Google Maps
- **AI Layer**: OpenAI-compatible LLM (Python microservice)

### Core Philosophy

- **Buyer and Seller must NEVER contact directly**
- **Customer Service (Human + AI) is the mandatory mediator**
- **AI-first, Human-assisted architecture**
- **Zero spam, zero fake listings, zero time waste**
- **This is a Mediation Platform, not a classifieds app**

## 📁 Project Structure

```
bhoomisetu/
├── backend/              # NestJS Backend API
│   ├── src/
│   │   ├── ai/          # AI Service Integration Module
│   │   ├── auth/        # Authentication & Authorization Module
│   │   ├── users/       # User Management Module
│   │   ├── database/    # Database Configuration
│   │   └── main.ts      # Application Entry Point
│   └── package.json
├── db/
│   └── migrations/       # SQL Migration Files
├── doc.prompt.md         # Complete Product Specification
└── README.md            # This File
```

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- PostgreSQL >= 14
- npm or yarn

### Backend Setup

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure Environment Variables**
   
   Create a `.env` file in the `backend/` directory:
   ```env
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   DB_NAME=bhoomisetu_db

   # JWT
   JWT_SECRET=your-super-secret-key-change-in-production
   JWT_ACCESS_EXPIRES_IN=15m
   JWT_REFRESH_EXPIRES_IN=7d

   # Firebase Admin SDK (Choose ONE method below)
   # Option 1: Credentials file path (recommended for development)
   FIREBASE_CREDENTIALS_PATH=./bhoomisetu-48706-firebase-adminsdk-fbsvc-6e896e4e57.json
   
   # Option 2: Environment variables (recommended for production/containers)
   # FIREBASE_PROJECT_ID=bhoomisetu-48706
   # FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   # FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@bhoomisetu-48706.iam.gserviceaccount.com
   
   # Note: If credentials file exists in backend root, it will be auto-detected

   # AI Service (Optional - falls back gracefully if unavailable)
   AI_SERVICE_URL=http://localhost:8000
   AI_SERVICE_API_KEY=your-api-key-here
   AI_SERVICE_REQUIRED=false  # Set to true to throw errors if AI service unavailable

   # Google Maps API (Optional - for location geocoding, falls back to basic parsing)
   GOOGLE_MAPS_API_KEY=your-google-maps-api-key

   # Environment
   NODE_ENV=development
   PORT=3000
   ```

   **Firebase Setup**: 
   - Place your Firebase Admin SDK credentials JSON file in the `backend/` directory
   - Or set the environment variables as shown above
   - See `backend/FIREBASE_SETUP.md` for detailed instructions
   - ⚠️ **Never commit Firebase credentials to version control!** (Already in `.gitignore`)

3. **Run Database Migrations**
   
   First, ensure PostgreSQL is running and create the database:
   ```sql
   CREATE DATABASE bhoomisetu_db;
   ```
   
   Then run the initial migration:
   ```bash
   psql -U postgres -d bhoomisetu_db -f ../db/migrations/20260109_initial_auth_schema.sql
   ```
   
   Or use TypeORM CLI:
   ```bash
   npm run migration:run
   ```

4. **Start Development Server**
   ```bash
   npm run start:dev
   ```
   
   The API will be available at `http://localhost:3000/api`

## 📦 Modules

### Module 1: Authentication & Roles ✅

**Status**: ✅ **COMPLETE** - Implemented with JWT + TypeORM + Firebase + AI Integration

**Features**:
- ✅ Phone + OTP authentication (Firebase Admin SDK)
- ✅ Email + OTP authentication (Firebase Admin SDK)
- ✅ Social login (Google, Facebook, Apple via Firebase)
- 🔄 Passkey support (WebAuthn) - Architecture ready
- ✅ Role-based access control (RBAC)
- ✅ JWT token-based authentication
- ✅ Refresh token mechanism
- ✅ Session management with risk scoring
- ✅ **AI-powered fraud detection** (integrated)
- ✅ **AI-powered duplicate account detection** (integrated)
- ✅ **AI-powered session risk assessment** (integrated)

**Firebase Integration**:
- ✅ Firebase Admin SDK configured and integrated
- ✅ OTP verification via Firebase ID tokens
- ✅ Social login verification via Firebase ID tokens
- ✅ Secure credentials management (file or environment variables)
- 📖 See `backend/FIREBASE_SETUP.md` for setup instructions

**Roles**:
- `buyer` - End users interested in properties
- `seller` - Property owners
- `agent` - Real estate agents
- `customer_service` - CS agents mediating transactions
- `admin` - Platform administrators

**API Endpoints**:
- `POST /api/auth/otp/request` - Request OTP (logs request, Firebase handles delivery on client)
  - Body: `{ channel: 'sms' | 'email', destination: string, purpose: 'login' | 'signup' }`
  - Response: `{ success: boolean, message: string }`
- `POST /api/auth/otp/verify` - Verify OTP and login (requires Firebase ID token)
  - Body: `{ idToken: string, channel: 'sms' | 'email', deviceId?: string }`
  - Note: Client must verify OTP using Firebase SDK first, then send resulting ID token
  - Response: `{ user: User, roles: string[], tokens: { accessToken, refreshToken } }`
- `POST /api/auth/social` - Social login (Google/Facebook/Apple via Firebase)
  - Body: `{ provider: 'google' | 'facebook' | 'apple', idToken: string, deviceId?: string }`
  - Note: Client gets ID token from Firebase after social auth, sends to backend
  - Response: `{ user: User, roles: string[], tokens: { accessToken, refreshToken } }`
- `POST /api/auth/refresh` - Refresh access token
  - Body: `{ refreshToken: string }`
  - Response: `{ accessToken: string, refreshToken: string }`
- `GET /api/users/me` - Get current user profile (authenticated)
  - Headers: `Authorization: Bearer <accessToken>`
  - Response: `{ user: User, roles: string[] }`

**Database Tables**:
- `users` - User accounts
- `roles` - Available roles
- `user_roles` - User-role assignments
- `login_sessions` - Active login sessions
- `otp_logs` - OTP request/verification logs

### Module 2: Landing / Home ✅

**Status**: ✅ **COMPLETE** (Backend)

**Backend Implementation**:
- ✅ Property listing APIs with advanced filtering
- ✅ Featured properties endpoint
- ✅ New properties endpoint
- ✅ Property creation and management
- ✅ Subscription status check
- ✅ Home aggregation endpoint
- ✅ Premium features tracking

**Database**:
- ✅ Properties table with full schema
- ✅ Property images table
- ✅ Property features table
- ✅ Subscriptions table
- ✅ Property verification notes table (for Module 5)

**API Endpoints**:
- `POST /api/properties` - Create property (seller/agent)
- `GET /api/properties` - List with filters
- `GET /api/properties/featured` - Featured properties
- `GET /api/properties/new` - New properties
- `GET /api/properties/my` - My properties
- `GET /api/properties/:id` - Property details
- `GET /api/home` - Home page data
- `GET /api/subscriptions/status` - Subscription status

**Frontend (Pending)**:
- Premium Subscription Banner
- AI Search Bar
- New Properties (horizontal scroll)
- Featured Properties
- Testimonials
- AI Chat Entry Point

### Module 3: AI Powered Property Search ✅

**Status**: ✅ **COMPLETE** (Backend)

**Features**:
- ✅ Natural language search queries
- ✅ 5-step AI ranking algorithm
- ✅ Location normalization with geocoding
- ✅ Hard filters (price, type, location, etc.)
- ✅ AI-powered relevance ranking
- ✅ Similarity matching (±10% price)
- ✅ AI tags extraction (Beach, Waterfront, etc.)
- ✅ Multiple ranking options (relevance, price, popularity, urgency)

**API Endpoints**:
- `GET /api/search` - AI-powered property search
- `GET /api/search/properties` - Alias for search
- `GET /api/search/suggestions` - Search suggestions (authenticated)

### Module 5: Customer Service Verification ✅

**Status**: ✅ **COMPLETE** (Backend) - **CRITICAL MODULE**

**Features**:
- ✅ CS agent dashboard API
- ✅ Property verification workflow (CRITICAL - only way properties go LIVE)
- ✅ Phone verification with seller (seller contact accessible to CS)
- ✅ Ownership validation (via CS verification process)
- ✅ Urgency level capture (low, normal, high, urgent)
- ✅ Negotiation flexibility notes
- ✅ CS agent statistics dashboard
- ✅ Property reassignment (admin only)

**Property Workflow (CRITICAL - NON-NEGOTIABLE)**:
1. **DRAFT** - Seller creates property
2. **PENDING_VERIFICATION** - Seller submits for verification (status cannot be changed by seller)
3. **CS Verification** - CS agent verifies (phone call, ownership check)
   - If **APPROVED** → **LIVE** status (visible to buyers) - **ONLY after CS approval**
   - If **REJECTED** → **REJECTED** status (seller can edit and resubmit)
4. **LIVE** - Approved properties visible to buyers

**CRITICAL RULE**: Properties **CANNOT** go LIVE without CS verification. This is enforced at the backend level. Sellers cannot change property status from PENDING_VERIFICATION to LIVE.

**API Endpoints** (requires `customer_service` or `admin` role):
- `GET /api/customer-service/pending` - Get pending verifications (CS dashboard)
  - Query params: `status`, `city`, `propertyType`, `urgencyLevel`, `page`, `limit`, `search`
  - Response: `{ properties: PendingVerificationProperty[], total, page, limit }`
- `GET /api/customer-service/properties/:id` - Get property details for verification
  - Response: `{ property, seller, verificationNotes }`
- `POST /api/customer-service/verify` - Verify property (approve/reject)
  - Body: `{ propertyId: UUID, urgencyLevel: 'low'|'normal'|'high'|'urgent', negotiationNotes?: string, remarks?: string, action: 'approve'|'reject', rejectionReason?: string }`
  - **If approve**: Property moves from PENDING_VERIFICATION → LIVE
  - **If reject**: Property moves from PENDING_VERIFICATION → REJECTED
- `GET /api/customer-service/stats` - CS agent statistics
  - Response: `{ pending: number, verified: number, rejected: number, total: number }`
- `POST /api/customer-service/reassign/:propertyId` - Reassign property to another CS agent (admin only)
  - Body: `{ newCsAgentId: UUID }`

**Database Tables**:
- `property_verification_notes` - Stores CS verification notes
  - Fields: `property_id`, `cs_agent_id`, `urgency_level`, `negotiation_notes`, `remarks`, `verified_at`
- `properties` - Status field enforces workflow
  - Fields: `status` (enum), `verified_by`, `verified_at`, `rejection_reason`

**Features**:
- ✅ CS agent dashboard API
- ✅ Property verification workflow (CRITICAL - only way properties go LIVE)
- ✅ Phone verification with seller
- ✅ Ownership validation
- ✅ Urgency level capture (low, normal, high, urgent)
- ✅ Negotiation flexibility notes
- ✅ CS agent statistics

**Property Workflow (CRITICAL - NON-NEGOTIABLE)**:
1. **DRAFT** - Seller creates property
2. **PENDING_VERIFICATION** - Seller submits for verification
3. **CS Verification** - CS agent verifies (phone call, ownership check)
4. **LIVE** - Approved properties go LIVE (visible to buyers) - **ONLY after CS approval**
5. **REJECTED** - Rejected properties (seller can edit and resubmit)

**CRITICAL**: Properties **CANNOT** go LIVE without CS verification. This is enforced at the backend level.

**API Endpoints** (requires `customer_service` or `admin` role):
- `GET /api/customer-service/pending` - Get pending verifications with filters
  - Query params: `status`, `city`, `propertyType`, `urgencyLevel`, `page`, `limit`, `search`
- `GET /api/customer-service/properties/:id` - Get property details for verification
- `POST /api/customer-service/verify` - Verify property (approve/reject)
  - Body: `{ propertyId, urgencyLevel, negotiationNotes?, remarks?, action: 'approve' | 'reject', rejectionReason? }`
- `GET /api/customer-service/stats` - CS agent statistics (pending, verified, rejected, total)
- `POST /api/customer-service/reassign/:propertyId` - Reassign property to another CS agent (admin only)
  - Body: `{ newCsAgentId: string }`

**Database Tables**:
- `property_verification_notes` - Stores CS verification notes with urgency, negotiation notes, remarks
- `properties` - Status field enforces workflow (verified_by, verified_at, rejection_reason)

**Integration**:
- Google Maps Geocoding API (optional, with fallback)
- AI microservice ranking endpoint

### Module 4: Seller Property Listing (Pending)

**Note**: Property creation is already implemented in Module 2. Module 4 would add:
- Image upload endpoints (S3/Cloudinary integration)
- GPS location picker UI
- Enhanced dynamic fields based on property type

### Module 6: Buyer Requirement Posting ✅

**Status**: ✅ **COMPLETE** (Backend)

**Features**:
- ✅ Buyer requirement creation and management
- ✅ Location specification (with geocoding)
- ✅ Budget specification (min/max, sale/rent)
- ✅ Property type and feature requirements
- ✅ **AI Matching System** (CRITICAL)

**AI Matching Logic (CRITICAL - Enforced)**:
- ✅ **Location Match**: Same city (or locality)
- ✅ **Budget Overlap >= 80%**: Property price must overlap with requirement budget by 80% or more
- ✅ **Match Scoring**: Location score, budget score, overall score
- ✅ **Match Tracking**: Stores match details, reasons, and notification status
- 🔄 **Notifications**: Triggers for Seller + CS (Module 9 - placeholder)

**Matching Triggers**:
1. When a new buyer requirement is created → Matches against existing LIVE properties
2. When a property goes LIVE (after CS verification) → Matches against active requirements

**API Endpoints** (requires `buyer` or `admin` role):
- `POST /api/buyer-requirements` - Create buyer requirement
- `GET /api/buyer-requirements` - List buyer requirements (filtered)
- `GET /api/buyer-requirements/:id` - Get specific requirement
- `PUT /api/buyer-requirements/:id` - Update requirement
- `DELETE /api/buyer-requirements/:id` - Delete requirement
- `GET /api/buyer-requirements/:id/matches` - Get matches for a requirement

**Database Tables**:
- `buyer_requirements` - Stores buyer requirements
- `property_requirement_matches` - Tracks matches with scores and notification status

### Module 7: Mediation & Negotiation ✅

**Status**: ✅ **COMPLETE** (Backend) - **CRITICAL MODULE**

**Features**:
- ✅ Buyer interest expression in properties
- ✅ CS buyer seriousness check
- ✅ CS seller willingness re-check
- ✅ CS-mediated connection approval
- ✅ Chat/Call enabled ONLY after CS approval (CRITICAL)
- ✅ Contact hiding until CS approval (CRITICAL - NON-NEGOTIABLE)

**Mediation Workflow (CRITICAL - NON-NEGOTIABLE)**:
1. **Buyer expresses interest** → `PENDING` status (seller contact hidden)
2. **CS checks buyer seriousness** → Phone call, assessment → If approved, moves to seller check
3. **CS checks seller willingness** → Phone call with seller → If approved, both parties willing
4. **CS approves connection** → `CONNECTED` status → **Chat session created** → **Contact revealed**
5. **Chat/Call enabled** → Both parties can communicate through mediated chat (CS always present)

**CRITICAL RULES (Enforced at Backend Level)**:
- ✅ **Seller contact is ALWAYS hidden until CS approval** - enforced in all endpoints
- ✅ **Buyer contact is ALWAYS hidden until CS approval** - enforced in all endpoints
- ✅ **Chat/Call enabled ONLY after CS approval** - chat session created only after approval
- ✅ **CS agent is ALWAYS part of chat sessions** - mediates all conversations
- ✅ **Buyer and Seller CANNOT contact directly** - all communication through platform

**API Endpoints**:
- `POST /api/mediation/interest` - Express interest (buyer role)
  - Body: `{ propertyId, matchId?, message?, interestType?, priority? }`
  - **CRITICAL**: Seller contact NOT revealed at this stage
- `GET /api/mediation/my-interests` - Get buyer's own interests (buyer role)
- `GET /api/mediation/property-interests` - Get interests in seller's properties (seller/agent role)
- `GET /api/mediation/pending` - Get pending interests for CS review (customer_service/admin role)
- `GET /api/mediation/interests/:id` - Get specific interest expression (participants or CS)
- `POST /api/mediation/review/buyer-seriousness` - CS reviews buyer seriousness (customer_service role)
  - Body: `{ interestExpressionId, actionType, buyerSeriousnessScore, buyerSeriousnessNotes, outcome, notes }`
- `POST /api/mediation/review/seller-willingness` - CS checks seller willingness (customer_service role)
  - Body: `{ interestExpressionId, actionType, sellerWillingnessScore, sellerWillingnessNotes, outcome, notes }`
- `POST /api/mediation/approve-connection` - CS approves connection (customer_service role)
  - Body: `{ interestExpressionId, revealSellerContact?, revealBuyerContact?, notes }`
  - **CRITICAL**: This is when contact is revealed and chat session is created
- `POST /api/mediation/reject-connection/:id` - CS rejects connection (customer_service role)
  - **CRITICAL**: Contact remains hidden on rejection
- `GET /api/mediation/chat-sessions/:id` - Get chat session (only if connection approved)
- `POST /api/mediation/chat-sessions/:id/messages` - Send message in chat (participants only)

**Database Tables**:
- `interest_expressions` - Buyer interest expressions
  - Fields: `buyer_id`, `property_id`, `match_id`, `connection_status`, `seller_contact_revealed`, `cs_reviewed`, `buyer_seriousness_score`, `seller_willingness_checked`, `chat_session_id`
- `cs_mediation_actions` - All CS actions in mediation workflow
  - Fields: `interest_expression_id`, `cs_agent_id`, `action_type`, `buyer_seriousness_score`, `seller_willingness_score`, `outcome`, `notes`
- `chat_sessions` - Mediated chat sessions
  - Fields: `buyer_id`, `seller_id`, `cs_agent_id` (CRITICAL), `buyer_can_see_seller_contact`, `seller_can_see_buyer_contact`, `contact_revealed_at`, `status`
- `chat_messages` - All messages in chat sessions
  - Fields: `chat_session_id`, `sender_id`, `sender_role`, `content`, `is_moderated`, `moderated_by`

**Integration**:
- ✅ Works with Module 6 (buyer requirements) - matches can trigger interest expressions
- ✅ Works with Module 5 (CS verification) - CS agents handle mediation
- ✅ Contact hiding enforced at service level (cannot be bypassed)
- ✅ Chat session management ready for WebSocket integration (Module 9)

### Module 8: AI Chat Support (24/7) ✅

**Status**: ✅ **COMPLETE** (Backend) - **CRITICAL MODULE**

**Features**:
- ✅ 24/7 AI chat support for users
- ✅ Bilingual support: English and Telugu (automatic language detection)
- ✅ FAQ handling with knowledge base (bilingual)
- ✅ Property suggestions based on user queries
- ✅ Requirement updates assistance
- ✅ Appointment booking assistance (escalates to CS for confirmation)
- ✅ Intent detection and automatic escalation

**AI Prompt Rules (CRITICAL - NON-NEGOTIABLE)**:
- ✅ **NEVER share seller contact information directly** (phone, email, address) - enforced in system prompt
- ✅ **NEVER share buyer contact information directly** - enforced in system prompt
- ✅ **ALWAYS escalate serious intent to CS** (buy, purchase, negotiate, deal, contact requests) - enforced in system prompt
- ✅ Can provide property information, suggest properties, answer FAQs, and help with general queries
- ✅ If user asks for seller contact, politely explain that customer service will connect them after verification

**Escalation Triggers (CRITICAL)**:
- ✅ User shows serious intent to buy/negotiate
- ✅ User asks for seller contact
- ✅ User requests complex negotiations
- ✅ User asks for property viewing/appointment
- ✅ User expresses frustration or complaint
- ✅ User requests information about mediation/connection process

**AI Capabilities**:
- **FAQs**: Answer common questions about properties, pricing, verification process (bilingual)
- **Property Suggestions**: Suggest properties based on user requirements
- **Requirement Updates**: Help users update buyer requirements
- **Appointment Booking**: Assist with booking (but escalate to CS for confirmation)
- **General Information**: Provide platform information and guidance

**API Endpoints** (requires authentication):
- `POST /api/ai-chat/message` - Send message to AI chat
  - Body: `{ message, language?, conversationId?, sessionId?, contextType?, contextPropertyId?, contextRequirementId?, previousMessages? }`
  - Response: `ChatResponseDto` with AI response, detected intent, escalation status, property suggestions
- `GET /api/ai-chat/conversations/:id` - Get conversation history (user's own conversations only)
- `GET /api/ai-chat/conversations?page=1&limit=20` - Get user's conversations
- `POST /api/ai-chat/conversations/:id/close` - Close conversation
- `GET /api/ai-chat/faqs?category=general&language=en` - Get FAQs (bilingual)

**Database Tables**:
- `ai_chat_conversations` - AI chat conversations
  - Fields: `user_id`, `session_id`, `language` (en/te), `status`, `escalated_to_cs`, `cs_agent_id`, `context_type`, `context_property_id`, `context_requirement_id`, `user_intent`, `intent_confidence`, `escalation_reason`
- `ai_chat_messages` - All messages in conversations
  - Fields: `conversation_id`, `sender_type` (user/ai/cs), `sender_id`, `message_type`, `content`, `content_english`, `content_telugu`, `ai_model_version`, `ai_confidence`, `detected_intent`, `requires_escalation`, `escalation_reason`
- `ai_chat_actions` - Actions taken from AI suggestions
  - Fields: `conversation_id`, `message_id`, `action_type` (property_suggested, requirement_updated, appointment_booked, escalated_to_cs), `action_data`, `status`, `user_acknowledged`, `user_feedback`
- `ai_chat_faqs` - Knowledge base for FAQ handling
  - Fields: `question_english`, `question_telugu`, `answer_english`, `answer_telugu`, `category`, `tags[]`, `view_count`, `helpful_count`, `not_helpful_count`, `is_active`

**Integration**:
- ✅ Works with AI microservice (`/chat/completion` endpoint - OpenAI-compatible)
- ✅ Works with Properties module (property suggestions)
- ✅ Works with Buyer Requirements module (requirement updates)
- ✅ Escalates to Customer Service module (Module 5/7) when serious intent detected
- ✅ Uses Users module for role checking
- ✅ Fallback responses when AI service unavailable (graceful degradation)

### Module 9: Notifications ✅

**Status**: ✅ **COMPLETE** (Backend) - **CRITICAL MODULE**

**Features**:
- ✅ Multi-channel notifications (Push via Firebase FCM, SMS, Email)
- ✅ User notification preferences (per-channel, per-type, quiet hours)
- ✅ Delivery tracking with detailed logs
- ✅ Automatic retry logic for failed deliveries
- ✅ Notification expiration and cleanup

**Notification Triggers (All Implemented)**:
- ✅ **New matching property** (Module 6): Notifies buyer, seller (without revealing buyer contact), and CS agents
- ✅ **Interest expression** (Module 7): Notifies seller when buyer expresses interest (CRITICAL: buyer contact hidden)
- ✅ **Mediation updates** (Module 7): Notifies buyer/seller about mediation status, connection approval/rejection
- ✅ **AI chat escalation** (Module 8): Notifies CS agents when conversation escalated
- ✅ **CS follow-up** (Module 5/7): CS agents can send custom notifications
- ✅ **Price drop** (ready for Module 4): Notifies buyers when property price drops
- ✅ **Viewing reminder** (ready): Notifies users about scheduled property viewings
- ✅ **Subscription renewal** (ready for Module 10): Notifies users about subscription renewals

**Channels**:
- ✅ **Push Notifications**: Firebase Cloud Messaging (FCM) - Fully integrated
- ✅ **SMS**: Ready for SMS gateway integration (Twilio, AWS SNS, etc.)
- ✅ **Email**: Ready for email service integration (SendGrid, AWS SES, etc.)

**CRITICAL Rules Enforced**:
- ✅ **Buyer contact is NEVER revealed to seller** in notifications (CRITICAL)
- ✅ **Seller contact is NEVER revealed to buyer** in notifications (CRITICAL)
- ✅ Generic notification messages used ("A buyer has expressed interest", "Customer service will contact you")
- ✅ Contact details only shared after CS approval (Module 7)
- ✅ Multi-channel delivery (notification sent via all enabled channels)
- ✅ Graceful degradation (if one channel fails, others still attempt)

**API Endpoints** (requires authentication):
- `GET /api/notifications?page=1&limit=20&unreadOnly=true` - Get user notifications
- `PUT /api/notifications/:id/read` - Mark notification as read
- `GET /api/notifications/preferences` - Get user notification preferences
- `PUT /api/notifications/preferences` - Update user notification preferences (enable/disable channels, types, quiet hours)
- `POST /api/notifications/fcm-token` - Update FCM token for push notifications

**Database Tables**:
- `notification_preferences` - User preferences for notification channels and types
  - Fields: `user_id`, `push_enabled`, `sms_enabled`, `email_enabled`, per-type preferences, `quiet_hours_start/end`, `fcm_token`, `phone_number`, `email_address`
- `notifications` - All notifications sent to users
  - Fields: `user_id`, `type`, `title`, `message`, `message_english`, `message_telugu`, `data` (JSONB), `priority`, `status`, `read_at`, `channels_sent[]`, delivery timestamps, `delivery_error`, `retry_count`, `expires_at`
- `notification_delivery_logs` - Detailed delivery logs for each channel attempt
  - Fields: `notification_id`, `channel` (push/sms/email), `status`, `status_message`, `delivered_at`, `opened_at`, `clicked_at`, `provider_message_id`, `provider_response` (JSONB), `error_code`, `error_message`
- `notification_templates` - Reusable notification templates (bilingual support, ready for future use)

**Integration**:
- ✅ Works with Module 5 (Customer Service) - CS agents notified about property matches
- ✅ Works with Module 6 (Buyer Requirements) - Property match notifications (buyer, seller, CS)
- ✅ Works with Module 7 (Mediation) - Interest expression, mediation updates, connection approval/rejection (CRITICAL: contact hiding enforced)
- ✅ Works with Module 8 (AI Chat) - Escalation notifications to CS agents
- ✅ Works with Users module - CS agent finding for escalations
- ✅ Works with Firebase module - FCM push notification delivery
- ✅ Delivery tracking with detailed logs per channel

### Module 10: Payments & Subscriptions ✅

**Status**: ✅ **COMPLETE** (Backend)

**Features:**
- ✅ Premium subscription purchase (Razorpay/Stripe structure ready for SDK integration)
- ✅ Priority listing (Properties module integrated - premium seller properties sorted first)
- ✅ Faster mediation (Mediation module integrated - premium users get HIGH priority)
- ✅ Featured badge (Properties module integrated - purchased via subscription)
- ✅ Subscription management (purchase, extend, cancel, auto-renewal)
- ✅ Payment processing (order creation, verification, webhooks, refunds)
- ✅ Payment methods (save cards, default method, AI checks)
- ✅ Subscription plans (9 plans seeded: Premium Seller/Buyer Monthly/Quarterly/Annual, Featured Listing)

**AI Checks (CRITICAL):**
- ✅ Fraud detection (blocks payments with risk score > 70)
- ✅ Duplicate cards (flags same card across multiple accounts)
- ✅ Location mismatch (flags billing address vs user location mismatch)

**API Endpoints:**
- `GET /api/payments/plans?planType=premium_seller` - Get subscription plans (public)
- `GET /api/payments/plans/:id` - Get plan by ID (public)
- `POST /api/payments/orders` - Create payment order
  - Body: `{ planId: string, gateway?: 'razorpay' | 'stripe', paymentMethodId?: string, propertyId?: string }`
  - Returns: `{ orderId, amount, currency, gateway, orderData }` (gateway-specific order data)
- `POST /api/payments/verify` - Verify and process payment
  - Body: `{ paymentId: string, gatewayPaymentId: string, gatewaySignature?: string }`
  - Performs AI fraud checks, activates subscription, sends notifications
- `POST /api/payments/webhooks/:gateway` - Process webhook (public, signature authenticated)
- `GET /api/payments/methods` - Get user payment methods
- `GET /api/payments` - Get user payments (paginated)
- `GET /api/payments/:id` - Get payment by ID
- `POST /api/payments/:id/refund` - Refund payment (Admin/CS only)
- `GET /api/subscriptions/status` - Get subscription status
- `GET /api/subscriptions/features` - Get premium features
- `GET /api/subscriptions` - Get user's active subscriptions
- `PUT /api/subscriptions/:id/cancel` - Cancel subscription
- `PUT /api/subscriptions/:id/auto-renewal` - Enable/disable auto-renewal

**Database Tables:**
- `subscription_plans` - 9 plans seeded (Premium Seller/Buyer Monthly/Quarterly/Annual, Featured Listing)
- `payment_methods` - User saved cards with AI flags (duplicate_card_flagged, location_mismatch_flagged)
- `payments` - All transactions with AI check results (fraud_risk_score, duplicate_card_detected, location_mismatch_detected)
- `subscription_transactions` - Links payments to subscriptions (purchases, renewals, upgrades)
- `payment_webhooks` - Webhook event storage (Razorpay/Stripe events)
- Enhanced `subscriptions` table - Added plan reference, auto-renewal, cancellation fields

**Integration:**
- ✅ Works with Properties module - Priority listing, featured badge, premium seller properties sorted first
- ✅ Works with Mediation module - Faster mediation (HIGH priority for premium users)
- ✅ Works with Notifications module - Subscription activation, payment success/failure, subscription expiry
- ✅ Works with AI service - Fraud detection, risk scoring, duplicate card detection, location mismatch
- ✅ Works with Users module - User-specific subscriptions and payments

**Payment Gateway Integration:**
- **Razorpay**: Structure ready for SDK integration (order creation, signature verification, refunds)
- **Stripe**: Structure ready for SDK integration (payment intent, webhook verification, refunds)
- **Current**: Simulated payment processing (for development/testing)
- **Production**: Install gateway SDKs (`npm install razorpay` or `npm install stripe`) and add credentials to `.env`

**Premium Features Enforcement:**
- **Priority Listing**: Premium seller properties automatically marked with `isPremium = true`, sorted first in search results
- **Faster Mediation**: Premium buyers/sellers automatically get `HIGH` priority when expressing interest
- **Featured Badge**: Purchased via subscription, property marked as `isFeatured = true` until expiration

### Module 11: Reviews & Feedback ✅

**Status**: ✅ **COMPLETE** (Backend)

**Features:**
- ✅ Rating after viewing/deal (verified purchases only)
- ✅ AI sentiment analysis (automatic, positive/negative/neutral/mixed)
- ✅ Fake review detection (AI-powered with multiple signals)
- ✅ Review moderation (auto-approval, manual review for flagged reviews)
- ✅ Helpful votes (users can vote if reviews are helpful)
- ✅ Review reports (users can report inappropriate reviews)
- ✅ Seller/Agent replies (with moderation)

**API Endpoints:**
- `POST /api/reviews` - Create review (Buyer role)
- `GET /api/reviews` - Get all reviews with filters (public)
- `GET /api/reviews/:id` - Get single review (public)
- `PATCH /api/reviews/:id` - Update review (Buyer role, owner only)
- `POST /api/reviews/:id/helpful` - Vote helpful (authenticated)
- `POST /api/reviews/:id/report` - Report review (authenticated)
- `POST /api/reviews/:id/reply` - Create reply (Seller/Agent role)
- `GET /api/reviews/property/:propertyId` - Get reviews for property (public)
- `GET /api/reviews/seller/:revieweeId` - Get reviews for seller/agent (public)

### Module 12: Admin Panel ✅

**Status**: ✅ **COMPLETE** (Backend)

**Features:**
- ✅ User management (list, view, update, suspend, activate, delete, role management)
- ✅ Property approvals (list pending, approve, reject - admin override)
- ✅ CS activity logs (mediation actions, verification logs)
- ✅ Payment reports (transactions, revenue, fraud reports, summary statistics)
- ✅ AI performance metrics (fraud detection, sentiment analysis, fake review detection)
- ✅ Admin dashboard (comprehensive statistics overview)
- ✅ Review moderation (flagged reviews, approve, reject, hide, reports)

**API Endpoints (All require Admin role):**
- `GET /api/admin/dashboard/stats` - Get dashboard statistics
- `GET /api/admin/users` - Get all users with filters
- `GET /api/admin/users/:id` - Get user by ID
- `PATCH /api/admin/users/:id` - Update user
- `POST /api/admin/users/:id/suspend` - Suspend user
- `POST /api/admin/users/:id/activate` - Activate user
- `DELETE /api/admin/users/:id` - Delete user (soft delete)
- `GET /api/admin/properties/pending` - Get pending properties
- `POST /api/admin/properties/:id/approve` - Approve property
- `POST /api/admin/properties/:id/reject` - Reject property
- `GET /api/admin/cs/activity-logs` - Get CS activity logs
- `GET /api/admin/cs/verification-logs` - Get CS verification logs
- `GET /api/admin/payments/reports` - Get payment reports
- `GET /api/admin/ai/metrics` - Get AI performance metrics
- `GET /api/admin/reviews/flagged` - Get flagged reviews
- `POST /api/admin/reviews/:id/approve` - Approve flagged review
- `POST /api/admin/reviews/:id/reject` - Reject flagged review
- `POST /api/admin/reviews/:id/hide` - Hide review
- `GET /api/admin/reviews/reports` - Get review reports

## 📚 Documentation

All documentation is organized in the `docs/` directory:

- **📋 Module Summaries**: [`docs/summary/`](docs/summary/) - Implementation summaries for each module
- **🧪 Testing Docs**: [`docs/testing/`](docs/testing/) - Testing summaries and verification reports
- **⚙️ Setup Guides**: [`docs/setup/`](docs/setup/) - Configuration and setup instructions
- **📖 API References**: [`docs/reference/`](docs/reference/) - Technical references and API contracts
- **📝 Development Guides**: [`docs/guides/`](docs/guides/) - Development guides and best practices
- **🗺️ Project Roadmap**: [`docs/ROADMAP.md`](docs/ROADMAP.md) - Project roadmap and module status
- **📜 Changelog**: [`docs/CHANGELOG.md`](docs/CHANGELOG.md) - Version history and changes

**Quick Links:**
- **Environment Variables**: See [`docs/reference/ENV_VARIABLES.md`](docs/reference/ENV_VARIABLES.md) or [`backend/ENV_SETUP.md`](backend/ENV_SETUP.md)
- **AI Service Contract**: [`docs/reference/AI_MICROSERVICE_CONTRACT.md`](docs/reference/AI_MICROSERVICE_CONTRACT.md)
- **Documentation Index**: [`docs/README.md`](docs/README.md)

## 🔧 Development

### Available Scripts

```bash
# Backend
npm run build          # Build TypeScript
npm run start          # Start production server
npm run start:dev      # Start development server with hot reload
npm run migration:run  # Run database migrations
npm run migration:generate  # Generate new migration
npm run migration:revert    # Revert last migration
```

### Code Structure

- **Entities**: TypeORM entities in `src/**/entities/`
- **Services**: Business logic in `src/**/*.service.ts`
- **Controllers**: API endpoints in `src/**/*.controller.ts`
- **DTOs**: Data transfer objects in `src/**/dto/`
- **Guards**: Authentication/authorization guards in `src/**/guards/`
- **Decorators**: Custom decorators in `src/**/decorators/`

## 🔐 Security

- JWT tokens with configurable expiration
- Refresh token rotation
- Role-based access control (RBAC)
- Password hashing (bcrypt)
- SQL injection protection (TypeORM parameterized queries)
- CORS configuration
- Environment variable validation

## 📚 Documentation

### Project Management
- [Development Roadmap](./ROADMAP.md) - Complete project roadmap and module status
- [Progress Summary](./PROGRESS_SUMMARY.md) - Current progress and statistics
- [Next Steps](./NEXT_STEPS.md) - Immediate tasks for Module 2
- [Changelog](./CHANGELOG.md) - Version history and changes

### Technical Guides
- [Module 3 Summary](./backend/MODULE3_SUMMARY.md) - AI-Powered Search implementation
- [Module 2 Summary](./backend/MODULE2_SUMMARY.md) - Properties and Home APIs implementation
- [Authentication Setup Guide](./backend/AUTH_SETUP.md) - JWT and RBAC implementation
- [Database Setup Guide](./backend/DATABASE_SETUP.md) - TypeORM and PostgreSQL setup
- [AI Microservice Contract](./backend/AI_MICROSERVICE_CONTRACT.md) - AI service API specification
- [AI Integration Summary](./backend/AI_INTEGRATION_SUMMARY.md) - AI service integration guide

### Specifications
- [Product Specification](./doc.prompt.md) - Complete product requirements

## 🗺️ Development Status

### ✅ Completed Modules
- **Module 1**: Authentication & Roles (JWT, RBAC, AI Fraud Detection)
- **Module 2**: Landing / Home (Properties APIs, Subscriptions, Home Endpoint)
- **Module 3**: AI Powered Property Search (Natural Language Search, AI Ranking)
- **Module 5**: Customer Service Verification (Property Verification Workflow)
- **Module 6**: Buyer Requirement Posting (Buyer Requirements, AI Matching)
- **Module 7**: Mediation & Negotiation (Interest Expression, CS Mediation, Contact Hiding)
- **Module 8**: AI Chat Support (24/7 AI Chat, FAQs, Property Suggestions, Escalation)
- **Module 9**: Notifications (Multi-channel: Push, SMS, Email)
- **Module 10**: Payments & Subscriptions (Premium Features, Payment Processing, AI Fraud Checks)

### 🔄 Current Phase
- **Phase 5**: Management & Analytics
- **Status**: ✅ All Core Modules Complete (Modules 1, 2, 3, 5, 6, 7, 8, 9, 10, 11, 12)
- **Next Steps**: Module 4 - Seller Property Listing (Backend ready, Module 5 verification complete) OR Frontend Implementation

See [ROADMAP.md](./ROADMAP.md) for detailed progress tracking.

## 🧪 Testing

Testing suites to be implemented:
- Unit tests
- Integration tests
- E2E tests

## 🚢 Deployment

Deployment scripts and documentation to be added.

## 📝 License

MIT
