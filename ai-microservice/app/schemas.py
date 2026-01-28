from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List, Literal


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    metadata: Optional[Dict[str, Any]] = None


class GenerateResponse(BaseModel):
    response: str
    confidence: float
    model: str
    structured: Dict[str, Any]
    latency_ms: int


class GenerateAsyncResponse(BaseModel):
    job_id: str
    status: str


class GenerateStatusResponse(BaseModel):
    job_id: str
    status: str
    result: Optional[GenerateResponse] = None


class FraudScoreRequest(BaseModel):
    requestType: Literal["otp_request", "signup", "login", "session_creation", "payment"]
    timestamp: str
    userId: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    firebaseUid: Optional[str] = None
    ipAddress: Optional[str] = None
    userAgent: Optional[str] = None
    deviceId: Optional[str] = None
    deviceFingerprint: Optional[str] = None
    previousAttempts: Optional[int] = None
    accountAge: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None


class FraudScoreResponse(BaseModel):
    riskScore: int
    riskLevel: Literal["low", "medium", "high", "critical"]
    reasons: List[str]
    recommendations: List[str]
    shouldBlock: bool
    shouldRequireManualReview: bool
    confidence: float


class DuplicateDetectionRequest(BaseModel):
    timestamp: str
    phone: Optional[str] = None
    email: Optional[str] = None
    firebaseUid: Optional[str] = None
    deviceId: Optional[str] = None
    deviceFingerprint: Optional[str] = None
    ipAddress: Optional[str] = None
    name: Optional[str] = None
    paymentMethodHash: Optional[str] = None


class DuplicateDetectionResponse(BaseModel):
    isDuplicate: bool
    confidence: float
    matchingAccounts: List[Dict[str, Any]] = Field(default_factory=list)
    recommendations: List[str]


class LocationData(BaseModel):
    latitude: float
    longitude: float
    city: Optional[str] = None
    country: Optional[str] = None


class SessionRiskRequest(BaseModel):
    userId: str
    currentTimestamp: str
    loginProvider: Literal["phone_otp", "email_otp", "google", "facebook", "apple", "passkey"]
    sessionId: Optional[str] = None
    ipAddress: Optional[str] = None
    userAgent: Optional[str] = None
    deviceId: Optional[str] = None
    deviceFingerprint: Optional[str] = None
    previousIpAddress: Optional[str] = None
    previousDeviceId: Optional[str] = None
    previousLocation: Optional[LocationData] = None
    currentLocation: Optional[LocationData] = None
    lastLoginAt: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


class SessionRiskResponse(BaseModel):
    riskScore: int
    riskLevel: Literal["low", "medium", "high", "critical"]
    reasons: List[str]
    shouldRequireVerification: bool
    shouldBlock: bool
    recommendations: List[str]
    confidence: float


class SentimentAnalysisRequest(BaseModel):
    reviewText: str = Field(..., min_length=1)
    rating: float = Field(..., ge=1.0, le=5.0)
    title: Optional[str] = None
    pros: Optional[str] = None
    cons: Optional[str] = None
    context: Optional[str] = None


class SentimentAnalysisResponse(BaseModel):
    sentimentScore: float
    sentimentLabel: Literal["positive", "negative", "neutral", "mixed"]
    confidence: float
    keyPhrases: List[str]
    topics: List[str]
    analysis: Dict[str, Any]


class PreviousReview(BaseModel):
    reviewId: str
    reviewText: str
    rating: float = Field(..., ge=1.0, le=5.0)
    createdAt: str


class FakeDetectionContext(BaseModel):
    previousReviews: Optional[List[PreviousReview]] = None
    reviewCount: Optional[int] = None
    accountAge: Optional[int] = None
    verifiedPurchase: Optional[bool] = None


class FakeReviewDetectionRequest(BaseModel):
    reviewText: str = Field(..., min_length=1)
    rating: float = Field(..., ge=1.0, le=5.0)
    reviewerId: str
    revieweeId: str
    title: Optional[str] = None
    propertyId: Optional[str] = None
    interestExpressionId: Optional[str] = None
    chatSessionId: Optional[str] = None
    context: Optional[FakeDetectionContext] = None


class FakeReviewDetectionResponse(BaseModel):
    fakeReviewScore: float
    isFake: bool
    confidence: float
    reasons: List[str]
    analysis: Dict[str, Any]
    recommendations: List[str]


class ChatCompletionRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_history: Optional[List[Dict[str, Any]]] = None
    language: Optional[Literal["en", "te", "hi"]] = "en"
    context: Optional[Dict[str, Any]] = None
    system_prompt: Optional[str] = None


class ChatCompletionResponse(BaseModel):
    response: str
    requiresEscalation: bool = False
    confidence: float = 0.4
