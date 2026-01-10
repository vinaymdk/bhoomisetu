# Module 7: Mediation & Negotiation - Implementation Summary

## ✅ Status: COMPLETE

Module 7 (Mediation & Negotiation) has been successfully implemented. This is a **CRITICAL** module that enforces the core platform philosophy: **Buyer and Seller must NEVER contact directly**.

## 🎯 Key Features Implemented

### 1. Interest Expression System
- Buyers can express interest in properties
- Links to property-requirement matches (from Module 6)
- Initial message from buyer (optional)
- Interest types: viewing, offer, negotiation, serious_intent
- Priority levels: low, normal, high, urgent

### 2. CS Mediation Workflow (CRITICAL)
**4-Step Mediation Process:**
1. **Buyer Expresses Interest** → `PENDING` status
   - Seller contact **HIDDEN** from buyer
   - Buyer contact **HIDDEN** from seller

2. **CS Reviews Buyer Seriousness** → `CS_REVIEWING` → `SELLER_CHECKING` (if approved)
   - CS agent assesses buyer seriousness (0-100 score)
   - CS notes on buyer seriousness
   - Outcome: approve (move to seller check) or reject

3. **CS Checks Seller Willingness** → `SELLER_CHECKING` → `APPROVED` (if both willing)
   - CS agent checks seller willingness (phone call)
   - CS assesses seller willingness (0-100 score)
   - Outcome: approve (both willing) or reject

4. **CS Approves Connection** → `CONNECTED` status
   - Chat session created (CS always included)
   - **Contact revealed** (seller to buyer, buyer to seller)
   - Chat/Call enabled

### 3. Contact Hiding (CRITICAL - NON-NEGOTIABLE)
- ✅ Seller contact **ALWAYS** hidden until CS approval
- ✅ Buyer contact **ALWAYS** hidden until CS approval
- ✅ Enforced at service level (cannot be bypassed)
- ✅ Applied in all endpoints (buyer views, seller views)
- ✅ Only CS agents/admins can see both contacts

### 4. Chat Session Management
- Chat sessions created ONLY after CS approval
- CS agent is ALWAYS part of chat session (mediates)
- Contact visibility controlled per session
- Message support (text, image, file, system)
- Message moderation by CS (flags, removes, edits)

### 5. CS Dashboard & Workflow
- List pending interest expressions
- Filter by status, property, buyer, seller
- Review buyer seriousness
- Check seller willingness
- Approve/reject connections
- Track all CS actions (audit trail)

## 📁 Files Created

```
backend/src/mediation/
├── mediation.module.ts                # Module registration
├── mediation.controller.ts            # API endpoints
├── mediation.service.ts               # Business logic + contact hiding enforcement
└── entities/
    ├── interest-expression.entity.ts  # Interest expressions
    ├── cs-mediation-action.entity.ts  # CS actions (audit trail)
    ├── chat-session.entity.ts         # Chat sessions (CS mediated)
    └── chat-message.entity.ts         # Chat messages
└── dto/
    ├── express-interest.dto.ts        # Express interest DTO
    ├── cs-review-interest.dto.ts      # CS review DTO
    ├── approve-connection.dto.ts      # Approve connection DTO
    └── mediation-filter.dto.ts        # Filter DTO

db/migrations/
└── 20260109_mediation_schema.sql      # Database migration
```

## 🔌 API Endpoints

### Buyer Endpoints
```
POST /api/mediation/interest
Body: { propertyId, matchId?, message?, interestType?, priority? }
Response: InterestExpression (seller contact HIDDEN)

GET /api/mediation/my-interests?status=pending&page=1&limit=20
Response: { interests: InterestExpression[], total, page, limit }
Note: Seller contact HIDDEN until connection approved
```

### Seller Endpoints
```
GET /api/mediation/property-interests?status=pending&page=1&limit=20
Response: { interests: InterestExpression[], total, page, limit }
Note: Buyer contact HIDDEN until connection approved
```

### CS Agent Endpoints
```
GET /api/mediation/pending?connectionStatus=pending&page=1&limit=20
Response: { interests: InterestExpression[], total, page, limit }
Note: CS can see ALL contacts

POST /api/mediation/review/buyer-seriousness
Body: {
  interestExpressionId,
  actionType: 'buyer_seriousness_check',
  buyerSeriousnessScore: 0-100,
  buyerSeriousnessNotes,
  outcome: 'approved' | 'rejected',
  notes,
  internalNotes
}

POST /api/mediation/review/seller-willingness
Body: {
  interestExpressionId,
  actionType: 'seller_willingness_check',
  sellerWillingnessScore: 0-100,
  sellerWillingnessNotes,
  outcome: 'approved' | 'rejected',
  notes,
  internalNotes
}

POST /api/mediation/approve-connection
Body: {
  interestExpressionId,
  revealSellerContact: true (default),
  revealBuyerContact: true (default),
  notes,
  internalNotes
}
Response: InterestExpression + ChatSession created
Note: This is when contact is revealed and chat is enabled

POST /api/mediation/reject-connection/:id
Body: { reason?: string }
Response: InterestExpression (status: REJECTED, contact remains HIDDEN)
```

### Chat Session Endpoints (After Connection Approved)
```
GET /api/mediation/chat-sessions/:id
Response: ChatSession with messages (contacts revealed if approved)

POST /api/mediation/chat-sessions/:id/messages
Body: { content: string, messageType?: 'text' | 'image' | 'file' }
Response: ChatMessage
Note: Only participants (buyer, seller, CS) can send messages
```

## 🔒 Security & Access Control

- All endpoints require authentication (`JwtAuthGuard`)
- Role-based access:
  - Buyer endpoints: `buyer` or `admin` role
  - Seller endpoints: `seller`, `agent`, or `admin` role
  - CS endpoints: `customer_service` or `admin` role
- Contact visibility enforced at service level:
  - Buyers cannot see seller contact until `sellerContactRevealed = true`
  - Sellers cannot see buyer contact until connection approved
  - Only CS/admins can see both contacts

## 🗄️ Database Schema

### `interest_expressions` Table
- Tracks buyer interest in properties
- Status workflow: `PENDING` → `CS_REVIEWING` → `SELLER_CHECKING` → `APPROVED` → `CONNECTED`
- Contact visibility flags: `seller_contact_revealed` (CRITICAL)
- CS assessment scores: `buyer_seriousness_score`, `seller_willingness_score`

### `cs_mediation_actions` Table
- Full audit trail of CS actions
- Action types: buyer_seriousness_check, seller_willingness_check, connection_approval, connection_rejection
- Outcomes: approved, rejected, needs_more_info, escalated
- Notes: public notes and internal notes (not visible to buyer/seller)

### `chat_sessions` Table
- Mediated chat sessions between buyer and seller
- **CRITICAL**: `cs_agent_id` is always present (CS mediates)
- Contact visibility: `buyer_can_see_seller_contact`, `seller_can_see_buyer_contact`
- Status: active, ended, paused, escalated

### `chat_messages` Table
- All messages in chat sessions
- Sender role tracking: buyer, seller, customer_service
- Message moderation: CS can flag, remove, edit messages
- Read receipts: `is_read`, `read_at`

## ⚠️ CRITICAL Rules Enforced

1. **Contact Hiding is MANDATORY**
   - Seller contact hidden until CS approval
   - Buyer contact hidden until CS approval
   - Cannot be bypassed by any user role (except CS/admin)

2. **Chat/Call Enabled ONLY After CS Approval**
   - Chat session created only when connection is approved
   - Messages can only be sent in active chat sessions
   - Only participants (buyer, seller, CS) can send messages

3. **CS is ALWAYS Present in Chat**
   - Every chat session includes a CS agent
   - CS mediates all conversations
   - CS can moderate messages

4. **Mediation Workflow is Sequential**
   - Cannot skip steps (must follow: interest → buyer check → seller check → approval)
   - Cannot approve connection without both checks completed
   - Cannot reveal contact without approval

5. **Access Control**
   - Buyers can only see their own interests
   - Sellers can only see interests in their properties
   - CS can see all interests
   - Chat sessions accessible only by participants

## 🔄 Integration Points

### With Module 5 (CS Verification)
- CS agents handle mediation (same agents verify properties)
- Uses same role system (`customer_service` role)

### With Module 6 (Buyer Requirements)
- Interest expressions can link to property-requirement matches
- Matches trigger interest notifications (Module 9)

### With Properties Module
- Interest expressions linked to properties
- Only LIVE properties can receive interest expressions

### With Users Module
- Uses `UsersService` for role checking
- Contact hiding applied to user entities

### With AI Module
- Placeholder for AI moderation of messages
- AI can flag inappropriate messages for CS review

## 📝 Usage Example

### Complete Mediation Flow

1. **Buyer expresses interest**:
```bash
POST /api/mediation/interest
Authorization: Bearer <buyer_token>
Body: {
  "propertyId": "...",
  "matchId": "...",  // Optional: link to match from Module 6
  "message": "I'm interested in viewing this property",
  "interestType": "viewing",
  "priority": "normal"
}
Response: { 
  id: "...",
  connectionStatus: "pending",
  sellerContactRevealed: false,  // CRITICAL: Contact hidden
  property: { ... }  // Seller contact NOT included
}
```

2. **CS reviews buyer seriousness**:
```bash
POST /api/mediation/review/buyer-seriousness
Authorization: Bearer <cs_token>
Body: {
  "interestExpressionId": "...",
  "actionType": "buyer_seriousness_check",
  "buyerSeriousnessScore": 85,
  "buyerSeriousnessNotes": "Buyer seems serious, has budget confirmed",
  "outcome": "approved",
  "notes": "Approved for seller willingness check"
}
Response: { 
  connectionStatus: "seller_checking",  // Moved to next step
  csReviewed: true,
  buyerSeriousnessScore: 85
}
```

3. **CS checks seller willingness**:
```bash
POST /api/mediation/review/seller-willingness
Authorization: Bearer <cs_token>
Body: {
  "interestExpressionId": "...",
  "actionType": "seller_willingness_check",
  "sellerWillingnessScore": 90,
  "sellerWillingnessNotes": "Seller willing to negotiate, flexible on price",
  "outcome": "approved",
  "notes": "Both parties willing, ready for connection"
}
Response: { 
  connectionStatus: "approved",  // Ready for connection approval
  sellerWillingnessChecked: true,
  sellerWillingnessScore: 90
}
```

4. **CS approves connection** (CRITICAL STEP):
```bash
POST /api/mediation/approve-connection
Authorization: Bearer <cs_token>
Body: {
  "interestExpressionId": "...",
  "revealSellerContact": true,
  "revealBuyerContact": true,
  "notes": "Connection approved, chat enabled"
}
Response: {
  connectionStatus: "connected",
  sellerContactRevealed: true,  // CRITICAL: Contact revealed
  chatSessionId: "...",  // Chat session created
  property: {
    seller: {
      primaryPhone: "...",  // NOW visible
      primaryEmail: "..."   // NOW visible
    }
  }
}
```

5. **Buyer sends message** (Chat enabled):
```bash
POST /api/mediation/chat-sessions/<session-id>/messages
Authorization: Bearer <buyer_token>
Body: {
  "content": "Hello, I'd like to schedule a viewing",
  "messageType": "text"
}
Response: {
  id: "...",
  senderRole: "buyer",
  content: "Hello, I'd like to schedule a viewing",
  createdAt: "..."
}
```

## 🎯 Next Steps (Future Enhancements)

- [ ] WebSocket integration for real-time chat (Module 9)
- [ ] AI message moderation (flag inappropriate messages)
- [ ] Call session management (integrate with Twilio/Vonage)
- [ ] Message templates for CS agents
- [ ] Bulk actions for CS (approve/reject multiple)
- [ ] Mediation analytics dashboard
- [ ] SLA tracking (time to respond, time to approve)
- [ ] Escalation workflow (if CS cannot reach buyer/seller)

## ✅ Testing Checklist

- [x] Buyer can express interest (contact hidden)
- [x] CS can review buyer seriousness
- [x] CS can check seller willingness
- [x] CS can approve connection (contact revealed, chat created)
- [x] CS can reject connection (contact remains hidden)
- [x] Buyer cannot see seller contact until approved
- [x] Seller cannot see buyer contact until approved
- [x] Chat session created only after approval
- [x] Only participants can access chat sessions
- [x] Messages can be sent only in active chat sessions
- [x] CS can see all contacts
- [x] Access control enforced (role-based)

## 📚 Related Documentation

- `README.md` - Module 7 overview
- `ROADMAP.md` - Module 7 status
- `db/migrations/20260109_mediation_schema.sql` - Database schema
