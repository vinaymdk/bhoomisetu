Recently Git repository changed/removed at commited issue check the existing code once with all modules if any issues or lost code at any ware

If any UI components are required to proceed with Module 4, start by designing and implementing the necessary UI first. Otherwise, complete Module 4 directly.

After successfully completing Module 4, proceed with Frontend Development and test each feature accordingly.

Note: The logo-and-fav folder contains the Application Logo (for Mobile and Web) and Favicons (for Web).


Continue with Module 12(Admin Panel) after completed review and test it with all repective admin panel

Continue with pending works(Backend Requirements) of both 8 and 9 Modules and review both modules and test them as well

Whithout UI testing taking much time

Pending From My Side: Review all modules and let me know pending works from my side of production/live level

Review: All Modules completed till now and test any errors/missing functionality develop and fix them
Pending: Check with ROADMAP and do the pending works review and test accordingly 
Roadmap: Update

Database Name: bhoomisetu_db(modified)

Readme: Update for existing modules configurations

Gitignore: Update for existing modules

Documentation: Update with latest version

Vinod: 8074899334

Lakshman Ann: 8142324124

packge.json
npm install class-validator class-transformer
npm install @nestjs/typeorm typeorm pg

======================================
MODULE 1: Authentication & Roles
1. Roles & Core Concepts
Roles:
buyer
seller
agent
customer_service
admin
Principles:
Same user can have multiple roles (user_roles join table).
All requests authenticated via JWT (or Firebase ID token) + RBAC middleware.
AI hooks for fraud & duplicate detection run on signup and at risk events.

2. Database Schema (Auth & Roles)
users
id (UUID, PK)
primary_phone (VARCHAR, unique, nullable)
primary_email (VARCHAR, unique, nullable)
full_name (VARCHAR)
password_hash (for non‑Firebase/email passkeys if needed, nullable)
firebase_uid (VARCHAR, unique, nullable)
status (ENUM: pending, active, suspended, banned)
fraud_risk_score (SMALLINT, default 0)
last_login_at (TIMESTAMP, nullable)
created_at, updated_at, deleted_at (TIMESTAMPTZ, deleted_at nullable)
roles
id (PK, smallint or serial)
code (VARCHAR, unique, e.g. buyer, seller, agent, customer_service, admin)
name (VARCHAR)
description (TEXT)
created_at, updated_at
user_roles
id (UUID, PK)
user_id (FK → users.id)
role_id (FK → roles.id)
assigned_by (FK → users.id, nullable; system or admin)
created_at
login_sessions
id (UUID, PK)
user_id (FK → users.id)
device_id (VARCHAR, nullable)
ip_address (INET, nullable)
user_agent (TEXT, nullable)
refresh_token_hash (TEXT)
expires_at (TIMESTAMPTZ)
is_revoked (BOOLEAN, default false)
created_at, updated_at
risk_score (SMALLINT, nullable) – from AI microservice
login_provider (ENUM: phone_otp, email_otp, google, facebook, apple, passkey)
otp_logs
id (UUID, PK)
channel (ENUM: sms, email)
destination (VARCHAR) – phone or email
purpose (ENUM: login, signup, password_reset, 2fa)
otp_hash (TEXT)
expires_at (TIMESTAMPTZ)
attempts_count (INT, default 0)
max_attempts (INT, default 5)
is_used (BOOLEAN, default false)
sent_at (TIMESTAMPTZ)
verified_at (TIMESTAMPTZ, nullable)
metadata (JSONB) – context (IP, user_id guess, device)
fraud_risk_score (SMALLINT, nullable) – from AI
created_at

3. Auth Flows
3.1 Phone / Email + OTP (via Firebase)
High-level:
Client (Flutter / React) initiates: send OTP to phone/email.
Firebase handles OTP delivery; returns verification token for client.
Client submits verification token to backend; backend validates via Firebase Admin SDK.
Backend either:
Links to existing user, or
Creates new users row with firebase_uid, primary_phone / primary_email.
Backend:
Calls AI microservice for fraud & duplicate detection:
Inputs: user identifiers, IP, device, geo.
Update users.fraud_risk_score.
Creates login_sessions row.
Issues backend JWT/refresh token pair (or reuses Firebase ID token + session).
AI checks here:
Multiple accounts with same phone/email/IP/device.
High-frequency OTP requests (otp_logs).
Geolocation inconsistencies.
3.2 Social Login (Google / Facebook / Apple)
Client obtains provider token.
Sends to backend: provider, provider_token.
Backend verifies token with provider, extracts email/phone, provider user ID.
If corresponding record exists:
Attach provider ID, update last_login_at.
Else:
Create users record and default roles (likely buyer).
Same as OTP: AI fraud scoring + login_sessions entry.
3.3 Passkey (WebAuthn / Platform Biometric)
Handle at web/mobile client with WebAuthn / platform APIs; backend:
Stores public key credentials per user.
Auth flow issues session like others.
Treated as login_provider = 'passkey' in login_sessions.

4. RBAC & Middleware
Backend middlewares/guards:
JwtAuthGuard – verifies token, attaches user to request.
RolesGuard(requiredRoles[]) – checks user_roles for required roles.
Examples:
Buyer requirement posting → RolesGuard(['buyer']).
Property listing → RolesGuard(['seller', 'agent']).
Verification & mediation tools → RolesGuard(['customer_service', 'admin']).
Admin panel → RolesGuard(['admin']).

5. API Contracts for Module 1
These are backend endpoints (NestJS-style routing but tech-agnostic).
Auth – OTP
POST /auth/otp/request
Body: { channel: 'sms' | 'email', destination: string, purpose: 'login' | 'signup' }
Side effects: log otp_logs, optional AI check for abuse, trigger Firebase/SMS/email.
POST /auth/otp/verify
Body: { verificationId: string, otp: string, channel: 'sms' | 'email' }
Backend uses Firebase Admin SDK to confirm; on success:
Upsert user.
Call AI /auth/risk-session.
Create session + tokens.
Response: { accessToken, refreshToken, user, roles }
Auth – Social
POST /auth/social
Body: { provider: 'google' | 'facebook' | 'apple', idToken: string }
Response: { accessToken, refreshToken, user, roles }
Auth – Passkey
POST /auth/passkey/register/options
POST /auth/passkey/register/verify
POST /auth/passkey/login/options
POST /auth/passkey/login/verify
Response same pattern as above.
Sessions
POST /auth/refresh
Body: { refreshToken }
Creates new login_sessions or rotates token; checks AI risk if anomalous device/IP.
POST /auth/logout
Body: { sessionId } or current session.
Marks login_sessions.is_revoked = true.
User & Roles
GET /me
Returns { user, roles }.
GET /admin/users/:id
admin only; full user info + fraud risk.
POST /admin/users/:id/roles
Body: { rolesToAdd: string[], rolesToRemove: string[] }.
PATCH /admin/users/:id/status
Body: { status: 'pending' | 'active' | 'suspended' | 'banned' }.

6. Mobile (Flutter) & Web (React) – Module 1 Surfaces
Flutter app (auth module):
Screens:
Welcome / Role selection (or deferred to later).
Login options: Phone, Email, Google, Facebook, Apple, Passkey where supported.
OTP entry screen (Firebase Phone Auth integration).
State:
Secure token storage (e.g., flutter_secure_storage).
Global AuthProvider / BLoC / Riverpod linked to /me endpoint.
React web app (auth module):
Pages:
/login: login options (email/phone OTP, Google, Apple, Passkey).
/onboarding: collect basic profile if first login.
State:
Tokens in httpOnly cookies or secure storage.
React context for user + roles; auto-fetch /me on load.

7. AI Integration Points for Module 1
On OTP request:
Send aggregated metadata to AI: destination, IP, device_fingerprint, previous attempts.
AI returns fraud_risk_score; if above threshold, throttle/block and/or require CS manual review.
On signup / first login:
AI checks for duplicate accounts:
Matching phone/email, device, IP, payment methods, or similar names.
Persist risk in users.fraud_risk_score.
On session creation:
AI provides risk_score for session (location jump, IP quality, device anomalies).
Use to trigger extra checks (e.g., ask to verify phone/email again, or limit sensitive actions).
If you’d like, next I can either:
Start scaffolding actual backend code (NestJS-style module for auth + SQL migrations for these tables), or
Move to MODULE 2 (Landing / Home) for Flutter + React UI structure while keeping Module 1 at a design level.