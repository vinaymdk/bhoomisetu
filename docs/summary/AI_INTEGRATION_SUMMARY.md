# AI Integration Summary (Module 1 - Part C)

## ✅ Completed: AI Microservice Contract for Fraud/Risk Detection

### What's Implemented

1. **AI Service Module**
   - HTTP client service for Python microservice communication
   - Graceful fallback when AI service is unavailable
   - Timeout handling (5 seconds)
   - Error logging and safe defaults

2. **AI Service Methods**
   - `scoreFraudRisk()` - Fraud detection and risk scoring
   - `detectDuplicateAccounts()` - Duplicate account detection
   - `assessSessionRisk()` - Session risk assessment
   - `healthCheck()` - Service availability check

3. **Integration Points**
   - **OTP Request**: Fraud scoring before sending OTP
   - **User Signup/Login**: Fraud + duplicate detection
   - **Session Creation**: Risk assessment for new sessions

4. **DTOs (Data Transfer Objects)**
   - `FraudScoreRequestDto` / `FraudScoreResponseDto`
   - `DuplicateDetectionRequestDto` / `DuplicateDetectionResponseDto`
   - `SessionRiskRequestDto` / `SessionRiskResponseDto`

### AI Service Endpoints

The backend expects the Python microservice to expose:

1. **POST** `/fraud/score-user` - Fraud risk scoring
2. **POST** `/auth/detect-duplicate` - Duplicate account detection
3. **POST** `/auth/risk-session` - Session risk assessment
4. **GET** `/health` - Health check

See [AI_MICROSERVICE_CONTRACT.md](./AI_MICROSERVICE_CONTRACT.md) for complete API specification.

### Integration Flow

#### 1. OTP Request Flow

```
User requests OTP
  ↓
Backend calls AI: scoreFraudRisk()
  ↓
If shouldBlock === true → Block request
  ↓
If shouldRequireManualReview === true → Flag for CS
  ↓
Store fraudRiskScore in otp_logs
  ↓
Send OTP (if not blocked)
```

#### 2. User Signup/Login Flow

```
User signs up/logs in
  ↓
Backend calls AI: scoreFraudRisk()
  ↓
Backend calls AI: detectDuplicateAccounts()
  ↓
If duplicate detected → Update user.fraudRiskScore
  ↓
Backend calls AI: assessSessionRisk()
  ↓
Store riskScore in login_sessions
  ↓
If shouldRequireVerification === true → Require additional verification
  ↓
Create session and return tokens
```

### Environment Variables

Add to your `.env` file:

```env
# AI Service (Optional - falls back gracefully if unavailable)
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your-api-key-here
```

### Files Created/Modified

**New Files:**
- `src/ai/ai.module.ts` - AI module configuration
- `src/ai/ai.service.ts` - AI service implementation
- `src/ai/dto/fraud-score-request.dto.ts` - Fraud scoring DTOs
- `src/ai/dto/fraud-score-response.dto.ts`
- `src/ai/dto/duplicate-detection-request.dto.ts` - Duplicate detection DTOs
- `src/ai/dto/duplicate-detection-response.dto.ts`
- `src/ai/dto/session-risk-request.dto.ts` - Session risk DTOs
- `src/ai/dto/session-risk-response.dto.ts`
- `backend/AI_MICROSERVICE_CONTRACT.md` - Complete API documentation

**Modified Files:**
- `src/auth/auth.service.ts` - Integrated AI service calls
- `src/auth/auth.controller.ts` - Extract IP/user-agent for AI
- `src/auth/auth.module.ts` - Import AiModule
- `src/app.module.ts` - Import AiModule
- `package.json` - Added @nestjs/axios dependency

### Next Steps

1. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set Up AI Service (Optional)**
   - Implement Python microservice per contract
   - Or use mock service for development
   - Backend works without AI service (falls back gracefully)

3. **Test Integration**
   - Start backend: `npm run start:dev`
   - AI service calls will be logged
   - If AI service unavailable, safe defaults are used

4. **What You Can Do**
   - Implement Python microservice following the contract
   - Test fraud detection by sending suspicious requests
   - Monitor AI service health via health check
   - Customize risk thresholds in AI service

### Fallback Behavior

If the AI service is unavailable:
- **Fraud Scoring**: Returns low risk (allows request)
- **Duplicate Detection**: Returns no duplicates (allows signup)
- **Session Risk**: Returns low risk (allows session)

This ensures the backend continues to function even if the AI service is down, but security is reduced.

### Security Considerations

- **API Key**: Always use API key authentication
- **HTTPS**: Use HTTPS in production
- **Rate Limiting**: Implement rate limiting in AI service
- **Logging**: All AI calls are logged for audit
- **Monitoring**: Monitor AI service availability
