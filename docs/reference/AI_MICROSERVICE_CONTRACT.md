# AI Microservice Contract

## Overview

The AI microservice is a Python-based service that provides fraud detection, duplicate account detection, and risk scoring capabilities. It communicates with the NestJS backend via HTTP REST API.

## Base URL

```
AI_SERVICE_URL=http://localhost:8000
```

Default: `http://localhost:8000` (configurable via `AI_SERVICE_URL` environment variable)

## Authentication

All requests require an API key in the header:

```
X-API-Key: <your-api-key>
```

Configure via `AI_SERVICE_API_KEY` environment variable.

## Endpoints

### 1. Health Check

**GET** `/health`

Check if the AI service is available.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-09T10:00:00Z"
}
```

**Status Codes:**
- `200` - Service is healthy
- `503` - Service unavailable

---

### 2. Fraud Risk Scoring

**POST** `/fraud/score-user`

Score a user or request for fraud risk.

**Request Body:**
```typescript
{
  // User identifiers
  userId?: string;
  phone?: string;
  email?: string;
  firebaseUid?: string;
  
  // Context information
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  deviceFingerprint?: string;
  
  // Request metadata
  requestType: 'otp_request' | 'signup' | 'login' | 'session_creation' | 'payment';
  timestamp: string; // ISO 8601 format
  
  // Historical data (optional)
  previousAttempts?: number;
  accountAge?: number; // in days
  
  // Additional context
  metadata?: Record<string, any>;
}
```

**Response:**
```typescript
{
  riskScore: number; // 0-100, where 0 is safe, 100 is high risk
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[]; // List of risk factors identified
  recommendations: string[]; // Recommended actions
  shouldBlock: boolean; // Whether to block the request
  shouldRequireManualReview: boolean; // Whether CS should review
  confidence: number; // 0-1, confidence in the assessment
}
```

**Example Request:**
```json
{
  "phone": "+1234567890",
  "ipAddress": "192.168.1.1",
  "userAgent": "Mozilla/5.0...",
  "requestType": "otp_request",
  "timestamp": "2024-01-09T10:00:00Z",
  "previousAttempts": 3
}
```

**Example Response:**
```json
{
  "riskScore": 45,
  "riskLevel": "medium",
  "reasons": [
    "Multiple OTP requests from same IP",
    "Unusual device fingerprint"
  ],
  "recommendations": [
    "Require additional verification",
    "Monitor for suspicious activity"
  ],
  "shouldBlock": false,
  "shouldRequireManualReview": false,
  "confidence": 0.85
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request
- `500` - Internal server error

---

### 3. Duplicate Account Detection

**POST** `/auth/detect-duplicate`

Detect if a user is creating a duplicate account.

**Request Body:**
```typescript
{
  // User identifiers to check
  phone?: string;
  email?: string;
  firebaseUid?: string;
  
  // Device and network information
  deviceId?: string;
  deviceFingerprint?: string;
  ipAddress?: string;
  
  // Additional signals
  name?: string;
  paymentMethodHash?: string; // Hashed payment method for comparison
  
  // Context
  timestamp: string; // ISO 8601 format
}
```

**Response:**
```typescript
{
  isDuplicate: boolean;
  confidence: number; // 0-1
  matchingAccounts?: Array<{
    userId: string;
    matchType: 'phone' | 'email' | 'device' | 'ip' | 'payment' | 'name';
    matchScore: number; // 0-1
  }>;
  recommendations: string[];
}
```

**Example Request:**
```json
{
  "phone": "+1234567890",
  "email": "user@example.com",
  "deviceId": "device-123",
  "ipAddress": "192.168.1.1",
  "timestamp": "2024-01-09T10:00:00Z"
}
```

**Example Response:**
```json
{
  "isDuplicate": true,
  "confidence": 0.92,
  "matchingAccounts": [
    {
      "userId": "user-uuid-123",
      "matchType": "phone",
      "matchScore": 1.0
    },
    {
      "userId": "user-uuid-123",
      "matchType": "device",
      "matchScore": 0.85
    }
  ],
  "recommendations": [
    "Merge accounts if confirmed same user",
    "Flag for manual review"
  ]
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request
- `500` - Internal server error

---

### 4. Session Risk Assessment

**POST** `/auth/risk-session`

Assess the risk of a login session.

**Request Body:**
```typescript
{
  userId: string;
  sessionId?: string;
  
  // Current session info
  ipAddress?: string;
  userAgent?: string;
  deviceId?: string;
  deviceFingerprint?: string;
  
  // Previous session info (for comparison)
  previousIpAddress?: string;
  previousDeviceId?: string;
  previousLocation?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  
  // Current location
  currentLocation?: {
    latitude: number;
    longitude: number;
    city?: string;
    country?: string;
  };
  
  // Timing
  lastLoginAt?: string; // ISO 8601
  currentTimestamp: string; // ISO 8601
  
  // Additional context
  loginProvider: 'phone_otp' | 'email_otp' | 'google' | 'facebook' | 'apple' | 'passkey';
  metadata?: Record<string, any>;
}
```

**Response:**
```typescript
{
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  reasons: string[]; // e.g., "Location jump detected", "New device", "Unusual IP"
  shouldRequireVerification: boolean; // Whether to require additional verification
  shouldBlock: boolean; // Whether to block the session
  recommendations: string[];
  confidence: number; // 0-1
}
```

**Example Request:**
```json
{
  "userId": "user-uuid-123",
  "ipAddress": "203.0.113.1",
  "userAgent": "Mozilla/5.0...",
  "deviceId": "device-456",
  "previousIpAddress": "198.51.100.1",
  "previousDeviceId": "device-123",
  "lastLoginAt": "2024-01-08T10:00:00Z",
  "currentTimestamp": "2024-01-09T10:00:00Z",
  "loginProvider": "phone_otp"
}
```

**Example Response:**
```json
{
  "riskScore": 65,
  "riskLevel": "high",
  "reasons": [
    "Location jump detected (different country)",
    "New device detected",
    "IP address changed significantly"
  ],
  "shouldRequireVerification": true,
  "shouldBlock": false,
  "recommendations": [
    "Require email verification",
    "Send security alert to user"
  ],
  "confidence": 0.88
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request
- `500` - Internal server error

---

## Integration Points

### 1. OTP Request

When a user requests an OTP, the backend calls:

```typescript
await aiService.scoreFraudRisk({
  phone: dto.destination, // or email
  ipAddress: req.ip,
  userAgent: req.get('user-agent'),
  requestType: 'otp_request',
  timestamp: new Date().toISOString(),
});
```

**Action:** Block if `shouldBlock === true`

### 2. User Signup/Login

When a user signs up or logs in:

1. **Fraud Detection:**
```typescript
await aiService.scoreFraudRisk({
  phone: user.primaryPhone,
  email: user.primaryEmail,
  ipAddress,
  requestType: 'signup' | 'login',
  timestamp: new Date().toISOString(),
});
```

2. **Duplicate Detection:**
```typescript
await aiService.detectDuplicateAccounts({
  phone: user.primaryPhone,
  email: user.primaryEmail,
  firebaseUid: user.firebaseUid,
  deviceId,
  ipAddress,
  timestamp: new Date().toISOString(),
});
```

**Action:** 
- Update `user.fraudRiskScore` if duplicate detected
- Flag for manual review if `shouldRequireManualReview === true`

### 3. Session Creation

When creating a login session:

```typescript
await aiService.assessSessionRisk({
  userId: user.id,
  ipAddress,
  userAgent,
  deviceId,
  previousIpAddress: previousSession?.ipAddress,
  previousDeviceId: previousSession?.deviceId,
  lastLoginAt: user.lastLoginAt?.toISOString(),
  currentTimestamp: new Date().toISOString(),
  loginProvider: 'phone_otp',
});
```

**Action:**
- Store `riskScore` in `login_sessions.risk_score`
- Require additional verification if `shouldRequireVerification === true`

---

## Error Handling

The AI service includes fallback behavior:

- **Connection Errors:** Returns safe defaults (low risk) if service is unavailable
- **Timeout:** 5 second timeout, falls back to safe defaults
- **Invalid Responses:** Logs error and uses safe defaults

This ensures the backend continues to function even if the AI service is down.

---

## Implementation Notes

### Python Microservice Example

The AI microservice should be implemented as a Python FastAPI/Flask service with:

1. **ML Models:**
   - Fraud detection model (trained on historical fraud data)
   - Duplicate detection model (fuzzy matching + ML)
   - Risk scoring model (ensemble of multiple signals)

2. **Features:**
   - Real-time scoring
   - Batch processing for historical analysis
   - Model versioning
   - A/B testing support

3. **Data Sources:**
   - User behavior patterns
   - Device fingerprints
   - IP reputation databases
   - Historical fraud patterns

### Environment Variables

**Backend (.env):**
```env
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your-api-key-here
```

**AI Service (.env):**
```env
MODEL_PATH=/path/to/models
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
```

---

## Testing

### Manual Testing

1. **Health Check:**
```bash
curl http://localhost:8000/health
```

2. **Fraud Scoring:**
```bash
curl -X POST http://localhost:8000/fraud/score-user \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-key" \
  -d '{
    "phone": "+1234567890",
    "ipAddress": "192.168.1.1",
    "requestType": "otp_request",
    "timestamp": "2024-01-09T10:00:00Z"
  }'
```

### Integration Testing

The backend automatically tests AI service availability on startup and falls back gracefully if unavailable.

---

---

### 5. Search Result Ranking

**POST** `/search/rank-results`

Rank property search results based on relevance, urgency, and popularity.

**Request Body:**
```typescript
{
  userQuery: string; // Natural language search query
  properties: Array<{
    id: string;
    title: string;
    description?: string;
    price: number;
    location: {
      city: string;
      locality?: string;
      coordinates?: { latitude: number; longitude: number };
    };
    propertyType: string;
    bedrooms?: number;
    bathrooms?: number;
    area: number;
    features?: Record<string, any>;
    viewsCount: number;
    interestedCount: number;
    createdAt: string;
    isFeatured: boolean;
  }>;
  filters: {
    location?: { city?: string; coordinates?: { latitude: number; longitude: number } };
    priceRange?: { min?: number; max?: number };
    propertyType?: string;
    bedrooms?: number;
    bathrooms?: number;
    aiTags?: string[];
  };
  rankingPreference: 'relevance' | 'price' | 'popularity' | 'urgency' | 'newest';
}
```

**Response:**
```typescript
{
  rankedProperties: Array<{
    propertyId: string;
    relevanceScore: number; // 0-1
    urgencyScore?: number; // 0-1
    popularityScore?: number; // 0-1
    matchReasons: string[]; // e.g., "Matches location", "Within price range", "Has beach access"
    extractedAiTags?: string[]; // e.g., ['beach', 'waterfront', 'metro_connected']
  }>;
}
```

**Example Request:**
```json
{
  "userQuery": "2BHK apartment near beach in Hyderabad",
  "properties": [
    {
      "id": "prop-123",
      "title": "2BHK Apartment with Sea View",
      "description": "Beautiful apartment...",
      "price": 5000000,
      "location": {
        "city": "Hyderabad",
        "locality": "Beach Road",
        "coordinates": { "latitude": 17.3850, "longitude": 78.4867 }
      },
      "propertyType": "apartment",
      "bedrooms": 2,
      "bathrooms": 2,
      "area": 1200,
      "viewsCount": 150,
      "interestedCount": 12,
      "createdAt": "2024-01-09T10:00:00Z",
      "isFeatured": true
    }
  ],
  "filters": {
    "location": { "city": "Hyderabad" },
    "priceRange": { "min": 3000000, "max": 7000000 },
    "bedrooms": 2
  },
  "rankingPreference": "relevance"
}
```

**Example Response:**
```json
{
  "rankedProperties": [
    {
      "propertyId": "prop-123",
      "relevanceScore": 0.95,
      "urgencyScore": 0.7,
      "popularityScore": 0.85,
      "matchReasons": [
        "Matches location: Hyderabad",
        "Matches bedrooms: 2",
        "Extracted tag: beach access",
        "Within price range",
        "Featured property"
      ],
      "extractedAiTags": ["beach", "waterfront"]
    }
  ]
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request
- `500` - Internal server error

---

---

### 6. Sentiment Analysis (Reviews)

**POST** `/reviews/sentiment-analysis`

Analyze sentiment of review text (positive, negative, neutral, mixed).

**Request Body:**
```typescript
{
  reviewText: string; // Review comment text
  title?: string; // Review title (optional)
  pros?: string; // Pros section (optional)
  cons?: string; // Cons section (optional)
  rating: number; // Overall rating (1.0 to 5.0)
  context?: string; // Review context (after_viewing, after_deal, after_interaction)
}
```

**Response:**
```typescript
{
  sentimentScore: number; // -1.0 (negative) to 1.0 (positive)
  sentimentLabel: 'positive' | 'negative' | 'neutral' | 'mixed';
  confidence: number; // 0-1
  keyPhrases: string[]; // Key phrases extracted from review
  topics: string[]; // Topics identified (e.g., 'price', 'location', 'condition')
  analysis: {
    positiveAspects?: string[];
    negativeAspects?: string[];
    suggestions?: string[];
  };
}
```

**Example Request:**
```json
{
  "reviewText": "The property was in excellent condition, but the price was too high for the location.",
  "title": "Good property, expensive price",
  "rating": 3.5,
  "context": "after_viewing"
}
```

**Example Response:**
```json
{
  "sentimentScore": 0.2,
  "sentimentLabel": "mixed",
  "confidence": 0.88,
  "keyPhrases": ["excellent condition", "price too high", "location"],
  "topics": ["condition", "price", "location"],
  "analysis": {
    "positiveAspects": ["excellent condition"],
    "negativeAspects": ["price too high"],
    "suggestions": ["Price negotiation could improve sentiment"]
  }
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request
- `500` - Internal server error

---

### 7. Fake Review Detection

**POST** `/reviews/detect-fake`

Detect if a review is likely fake based on text analysis, patterns, and context.

**Request Body:**
```typescript
{
  reviewText: string; // Review comment text
  title?: string; // Review title (optional)
  rating: number; // Overall rating (1.0 to 5.0)
  reviewerId: string; // Reviewer user ID
  revieweeId: string; // Reviewee user ID
  propertyId?: string; // Property ID (if property review)
  interestExpressionId?: string; // Interest expression ID (for verification)
  chatSessionId?: string; // Chat session ID (for verification)
  context?: {
    previousReviews?: Array<{
      reviewId: string;
      reviewText: string;
      rating: number;
      createdAt: string;
    }>; // Previous reviews by same reviewer
    reviewCount: number; // Total reviews by reviewer
    accountAge?: number; // Account age in days
    verifiedPurchase: boolean; // Whether purchase/viewing is verified
  };
}
```

**Response:**
```typescript
{
  fakeReviewScore: number; // 0.0 (genuine) to 1.0 (fake)
  isFake: boolean; // True if fakeReviewScore > threshold (typically 0.7)
  confidence: number; // 0-1
  reasons: string[]; // Reasons for fake detection (e.g., 'generic_language', 'suspicious_pattern', 'duplicate_content', 'unusual_rating', 'timing_anomaly')
  analysis: {
    textPatterns?: {
      genericLanguage: boolean;
      duplicateContent: boolean;
      suspiciousKeywords: boolean;
    };
    ratingAnomalies?: {
      extremeRating: boolean; // 1.0 or 5.0 with generic text
      ratingMismatch: boolean; // Rating doesn't match text sentiment
    };
    behavioralPatterns?: {
      bulkReviewing: boolean; // Multiple reviews in short time
      accountAge: boolean; // Very new account
      unverifiedPurchase: boolean; // No verified purchase/viewing
    };
  };
  recommendations: string[];
}
```

**Example Request:**
```json
{
  "reviewText": "Great property, highly recommended!",
  "rating": 5.0,
  "reviewerId": "user-123",
  "revieweeId": "seller-456",
  "propertyId": "prop-789",
  "context": {
    "previousReviews": [
      {
        "reviewId": "rev-001",
        "reviewText": "Amazing service, highly recommended!",
        "rating": 5.0,
        "createdAt": "2024-01-08T10:00:00Z"
      }
    ],
    "reviewCount": 2,
    "accountAge": 5,
    "verifiedPurchase": false
  }
}
```

**Example Response:**
```json
{
  "fakeReviewScore": 0.75,
  "isFake": true,
  "confidence": 0.82,
  "reasons": [
    "generic_language",
    "duplicate_content",
    "unverified_purchase",
    "new_account"
  ],
  "analysis": {
    "textPatterns": {
      "genericLanguage": true,
      "duplicateContent": true,
      "suspiciousKeywords": false
    },
    "ratingAnomalies": {
      "extremeRating": true,
      "ratingMismatch": false
    },
    "behavioralPatterns": {
      "bulkReviewing": false,
      "accountAge": true,
      "unverifiedPurchase": true
    }
  },
  "recommendations": [
    "Require verified purchase/viewing for reviews",
    "Flag for manual review by CS",
    "Monitor reviewer for suspicious activity"
  ]
}
```

**Status Codes:**
- `200` - Success
- `400` - Invalid request
- `500` - Internal server error

---

## Future Enhancements

1. **Real-time Learning:** Update models based on new fraud patterns
2. **GraphQL Support:** Add GraphQL endpoint for complex queries
3. **Webhook Support:** Push notifications for high-risk events
4. **Analytics Dashboard:** Real-time fraud metrics and insights
5. **Multi-region Support:** Deploy AI service in multiple regions
6. **Search Autocomplete:** Property search suggestions and autocomplete
7. **Review Quality Scoring:** Additional metric for review quality beyond fake detection