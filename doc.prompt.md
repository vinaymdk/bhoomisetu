Mobile: Flutter (Android / iOS – Single Codebase)
Web: React (Responsive Web App)
Backend: Node.js (NestJS recommended)
DB (Relational): PostgreSQL
Cache / Realtime: Redis
Auth / OTP / Push: Firebase
Payments: Razorpay / Stripe
Maps: Google Maps
AI Layer: OpenAI-compatible LLM (Python microservice)

You are a Senior Product Architect + Full Stack Lead Engineer.

Build a REAL ESTATE MEDIATION PLATFORM (NOT a normal real estate app).

Core Philosophy (NON-NEGOTIABLE):
- Buyer and Seller must NEVER contact directly.
- Customer Service (Human + AI) is the mandatory mediator.
- AI-first, Human-assisted architecture.
- Zero spam, zero fake listings, zero time waste.
- This is a Mediation Platform, not a classifieds app.

Tech Stack Constraints:
- Mobile: Flutter (Android & iOS)
- Web: React (Responsive)
- Backend: Node.js (NestJS style modular monolith)
- Database: PostgreSQL
- Cache & Realtime: Redis + WebSockets
- Auth & Notifications: Firebase
- Payments: Razorpay / Stripe
- Maps: Google Maps
- AI: OpenAI-compatible LLM via Python microservice

Architecture Requirements:
- Modular Monolith (future microservice ready)
- REST APIs + WebSockets
- Role-based access control
- Secure, scalable, production-grade code


MODULE 1: Authentication & Roles
Roles:
- Buyer
- Seller / Agent
- Customer Service
- Admin
(Same user can have multiple roles)

Login Methods:
- Phone + OTP
- Email + OTP
- Google / Facebook / Apple
- Passkey (Biometric)

AI Responsibilities:
- Fraud detection
- Duplicate account detection
- Risk scoring

DB Tables:
- users
- roles
- user_roles
- login_sessions
- otp_logs

MODULE 2: Landing / Home
Components:
- Premium Subscription Banner
- AI Search Bar
- New Properties (horizontal scroll)
- Featured Properties
- Testimonials
- AI Chat Entry Point

UI Rules:
- Mobile: Sticky Bottom Navigation
- Web: Header + Footer

MODULE 3: AI Powered Property Search
Filters (Single Unified Section):
- Location (City / Area)
- Property Type
- Price Range
- Bedrooms / Bathrooms
- Special AI Tags (Beach, Waterfront)

AI Algorithm:
Input: user_search_query, filters
Step 1: Normalize location using geo-coordinates
Step 2: Apply hard filters (price, type)
Step 3: Rank by relevance, urgency, popularity
Step 4: Fetch similar properties within ±10% price
Step 5: Return paginated results

MODULE 4: Seller Property Listing
Flow:
- Sale / Rent
- Property Type
- Dynamic Fields (only relevant)
- Upload Images
- Optional GPS Pick
- Submit for Verification

IMPORTANT:
- Property must NOT go live immediately

MODULE 5: Customer Service Verification (CRITICAL)
CS Responsibilities:
- Phone verification with seller
- Ownership & detail validation
- Capture urgency & negotiation flexibility

New Mandatory Table:
property_verification_notes:
- property_id
- cs_agent_id
- urgency_level
- negotiation_notes
- remarks
- verified_at

Only after CS verification → Property becomes LIVE

MODULE 6: Buyer Requirement Posting
Buyer can post:
- Location
- Budget
- Property Type
- Required Features

AI Matching Logic:
IF location matches
AND budget overlap >= 80%
THEN notify Seller + Customer Service

MODULE 7: Mediation & Negotiation
Flow:
- Buyer shows interest
- CS checks buyer seriousness
- CS re-checks seller willingness
- CS connects both parties
- Chat / Call enabled ONLY at this stage

Rule:
Seller contact is hidden until CS approval

MODULE 8: AI Chat Support (24/7)
Capabilities:
- FAQs
- Property suggestions
- Appointment booking
- Requirement updates
- Telugu + English

AI Prompt:
"You are a real estate assistant.
Never share seller contact directly.
Always escalate serious intent to customer service."

MODULE 9: Notifications
Triggers:
- New matching property
- Price drop
- Viewing reminder
- Subscription renewal
- CS follow-up

Channels:
- Push
- SMS
- Email

MODULE 10: Payments & Subscriptions
Premium Features:
- Priority listing
- Faster mediation
- Featured badge

AI Checks:
- Fraud detection
- Duplicate cards
- Location mismatch

MODULE 11: Reviews & Feedback
- Rating after viewing / deal
- AI sentiment analysis
- Fake review detection

MODULE 12: Admin Panel
Controls:
- User management
- Property approvals
- CS activity logs
- Payment reports
- AI performance metrics

Final Deliverables:
- Clean architecture
- Secure APIs
- Scalable DB schema
- Production-ready Flutter + React apps
- AI deeply integrated in search, chat, fraud, and mediation
- Deployment scripts & documentation
- Testing suites (unit, integration, e2e)
Proceed module-by-module.
