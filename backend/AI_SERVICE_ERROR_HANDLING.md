# AI Service Error Handling Guide

## Overview

The backend is designed to work gracefully even when the AI microservice is unavailable. Connection errors are handled with fallback defaults, reducing log noise during development.

## Behavior

### When AI Service is Unavailable

When the AI service is not running or unreachable:

1. **Connection Errors** (ECONNREFUSED, ETIMEDOUT, ENOTFOUND):
   - Logged as **WARNING** (not ERROR) - only once per service instance
   - Fallback to safe defaults
   - Application continues normally
   - **No stack traces** for connection errors

2. **Other Errors**:
   - Logged as **ERROR** with full stack trace
   - May throw exceptions depending on configuration

### Fallback Defaults

**Fraud Detection:**
- Risk score: `0` (lowest risk)
- Risk level: `low`
- Should block: `false`
- Should require review: `false`

**Duplicate Detection:**
- Is duplicate: `false`
- Confidence: `0`

**Session Risk:**
- Risk score: `0` (lowest risk)
- Risk level: `low`
- Should block: `false`
- Should require verification: `false`

**Search Ranking:**
- Uses default ranking (featured first, then by views/price/popularity)
- No AI tags extracted
- Still returns valid results

## Configuration

### Environment Variables

```env
# AI Service URL (default: http://localhost:8000)
AI_SERVICE_URL=http://localhost:8000

# AI Service API Key (optional)
AI_SERVICE_API_KEY=your-api-key

# AI Service Required (default: false)
# If true, connection errors will throw exceptions instead of using fallback
AI_SERVICE_REQUIRED=false
```

### Options

1. **AI Service Available** (Default for Production):
   - AI service running and accessible
   - Full AI-powered features enabled
   - Fraud detection, duplicate detection, ranking all work

2. **AI Service Optional** (Default for Development):
   - AI service not running or unavailable
   - Uses fallback defaults
   - Application functions normally
   - Minimal log noise (one warning on first connection error)

3. **AI Service Required**:
   - Set `AI_SERVICE_REQUIRED=true`
   - Connection errors throw `SERVICE_UNAVAILABLE` exceptions
   - Use when AI service is critical for your environment

## Suppressing Warnings

### Option 1: Start AI Service

Start the AI microservice on port 8000:
```bash
# Your AI service should run on http://localhost:8000
python ai-service/app.py  # or your AI service command
```

### Option 2: Set AI Service as Optional (Default)

The service is already optional by default. The warning will only appear once per service instance startup.

### Option 3: Adjust Log Level

Set NestJS log level to suppress warnings:
```typescript
// In main.ts
app.useLogger(['error', 'log']); // Suppress warnings
```

Or via environment:
```env
LOG_LEVEL=error,log
```

### Option 4: Disable AI Service Checks

You can temporarily disable AI service calls in development by setting an invalid URL:
```env
AI_SERVICE_URL=http://localhost:9999  # Non-existent port
```

But this is not recommended - the fallback handling is already graceful.

## Expected Logs

### First Connection Error (Once per startup)
```
[WARN] [AiService] AI service unavailable at http://localhost:8000. Using fallback defaults. Set AI_SERVICE_REQUIRED=false to suppress this warning.
```

### Subsequent Connection Errors
- **No additional logs** - the warning is only logged once to reduce noise

### Actual Errors (Non-connection)
```
[ERROR] [AiService] Error calling AI fraud detection service: <error message>
<stack trace>
```

## Testing

### Test with AI Service Running
```bash
# Start AI service
cd ai-service
python app.py

# Start backend
cd backend
npm run start:dev
```

### Test without AI Service (Default)
```bash
# Just start backend - AI service calls will use fallback defaults
cd backend
npm run start:dev
```

You should see one warning message, then the application continues normally.

## Production Considerations

1. **AI Service Required**: Set `AI_SERVICE_REQUIRED=true` in production
2. **Health Checks**: Implement health checks for AI service
3. **Monitoring**: Monitor AI service availability
4. **Fallback Strategy**: Document your fallback behavior for stakeholders
5. **Security**: Ensure AI service errors don't expose sensitive information

---

**Note**: The current implementation is designed for development-friendly behavior. Adjust `AI_SERVICE_REQUIRED` for production environments where AI service availability is critical.
