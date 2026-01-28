import time
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Header, BackgroundTasks
from ..schemas import (
    GenerateRequest,
    GenerateResponse,
    GenerateAsyncResponse,
    GenerateStatusResponse,
    FraudScoreRequest,
    FraudScoreResponse,
    DuplicateDetectionRequest,
    DuplicateDetectionResponse,
    SessionRiskRequest,
    SessionRiskResponse,
    SentimentAnalysisRequest,
    SentimentAnalysisResponse,
    FakeReviewDetectionRequest,
    FakeReviewDetectionResponse,
    ChatCompletionRequest,
    ChatCompletionResponse,
)
from ..services.generator import generate_text, generate_job_id
from ..core.config import settings

router = APIRouter()

metrics: Dict[str, Any] = {
    "total_requests": 0,
    "total_errors": 0,
    "last_request_at": None,
}

jobs: Dict[str, Dict[str, Any]] = {}


def api_key_guard(x_api_key: str = Header(default="")) -> None:
    if settings.api_key and x_api_key != settings.api_key:
        raise HTTPException(status_code=401, detail="Invalid API key")


@router.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@router.get("/metrics")
def get_metrics() -> Dict[str, Any]:
    return metrics


@router.post("/generate", response_model=GenerateResponse, dependencies=[Depends(api_key_guard)])
def generate(payload: GenerateRequest) -> GenerateResponse:
    metrics["total_requests"] += 1
    metrics["last_request_at"] = int(time.time())
    try:
        result = generate_text(payload.prompt)
        return GenerateResponse(**result)
    except Exception:
        metrics["total_errors"] += 1
        return GenerateResponse(
            response="We could not process your request. Please try again.",
            confidence=0.2,
            model="fallback",
            structured={"summary": "fallback", "intent": "general"},
            latency_ms=0,
        )

@router.post("/fraud/score-user", response_model=FraudScoreResponse, dependencies=[Depends(api_key_guard)])
def fraud_score(_: FraudScoreRequest) -> FraudScoreResponse:
    return FraudScoreResponse(
        riskScore=0,
        riskLevel="low",
        reasons=[],
        recommendations=[],
        shouldBlock=False,
        shouldRequireManualReview=False,
        confidence=0.3,
    )


@router.post("/auth/detect-duplicate", response_model=DuplicateDetectionResponse, dependencies=[Depends(api_key_guard)])
def detect_duplicate(_: DuplicateDetectionRequest) -> DuplicateDetectionResponse:
    return DuplicateDetectionResponse(
        isDuplicate=False,
        confidence=0.2,
        matchingAccounts=[],
        recommendations=[],
    )


@router.post("/auth/risk-session", response_model=SessionRiskResponse, dependencies=[Depends(api_key_guard)])
def risk_session(_: SessionRiskRequest) -> SessionRiskResponse:
    return SessionRiskResponse(
        riskScore=0,
        riskLevel="low",
        reasons=[],
        shouldRequireVerification=False,
        shouldBlock=False,
        recommendations=[],
        confidence=0.3,
    )


@router.post("/reviews/sentiment-analysis", response_model=SentimentAnalysisResponse, dependencies=[Depends(api_key_guard)])
def sentiment_analysis(_: SentimentAnalysisRequest) -> SentimentAnalysisResponse:
    return SentimentAnalysisResponse(
        sentimentScore=0.0,
        sentimentLabel="neutral",
        confidence=0.3,
        keyPhrases=[],
        topics=[],
        analysis={
            "positiveAspects": [],
            "negativeAspects": [],
            "suggestions": [],
        },
    )


@router.post("/reviews/detect-fake", response_model=FakeReviewDetectionResponse, dependencies=[Depends(api_key_guard)])
def detect_fake(_: FakeReviewDetectionRequest) -> FakeReviewDetectionResponse:
    return FakeReviewDetectionResponse(
        fakeReviewScore=0.0,
        isFake=False,
        confidence=0.3,
        reasons=[],
        analysis={
            "textPatterns": {
                "genericLanguage": False,
                "duplicateContent": False,
                "suspiciousKeywords": False,
            },
            "ratingAnomalies": {
                "extremeRating": False,
                "ratingMismatch": False,
            },
            "behavioralPatterns": {
                "bulkReviewing": False,
                "accountAge": False,
                "unverifiedPurchase": False,
            },
        },
        recommendations=[],
    )


@router.post("/chat/completion", response_model=ChatCompletionResponse, dependencies=[Depends(api_key_guard)])
def chat_completion(payload: ChatCompletionRequest) -> ChatCompletionResponse:
    message = payload.message.strip()
    response_text, requires_escalation, confidence = _build_chat_response(message, payload.language or "en")
    return ChatCompletionResponse(
        response=response_text,
        requiresEscalation=requires_escalation,
        confidence=confidence,
    )


def _build_chat_response(message: str, language: str) -> tuple[str, bool, float]:
    if not message:
        return "Please share your requirement, location, and budget.", False, 0.3

    lower = message.lower()
    escalation_keywords = ["call", "visit", "buy", "sell", "deal", "negotiate", "complaint", "support"]
    property_keywords = ["bhk", "apartment", "plot", "villa", "flat", "budget", "price", "under", "near", "metro"]

    requires_escalation = any(word in lower for word in escalation_keywords)
    if requires_escalation:
        return (
            "I can connect you with Customer Support for further assistance. "
            "Please share your preferred location, budget, and property type so I can brief the team.",
            True,
            0.5,
        )

    if any(word in lower for word in property_keywords):
        return (
            "Got it. Please confirm your city, budget range, and property type (plot/flat/villa). "
            "I will suggest matching properties and share in-app links.",
            False,
            0.55,
        )

    if "requirement" in lower or "update" in lower:
        return (
            "Sure. Share the updated budget, location, and property type so I can update your requirement.",
            False,
            0.5,
        )

    return (
        "Thanks for reaching out. Please share your requirement, location, and budget so I can help with the next steps.",
        False,
        0.4,
    )

def _run_async_job(job_id: str, prompt: str) -> None:
    try:
        result = generate_text(prompt)
        jobs[job_id] = {"status": "done", "result": result}
    except Exception:
        jobs[job_id] = {"status": "failed", "result": None}


@router.post("/generate/async", response_model=GenerateAsyncResponse, dependencies=[Depends(api_key_guard)])
def generate_async(payload: GenerateRequest, background_tasks: BackgroundTasks) -> GenerateAsyncResponse:
    metrics["total_requests"] += 1
    metrics["last_request_at"] = int(time.time())
    job_id = generate_job_id()
    jobs[job_id] = {"status": "queued", "result": None}
    background_tasks.add_task(_run_async_job, job_id, payload.prompt)
    return GenerateAsyncResponse(job_id=job_id, status="queued")


@router.get("/generate/status/{job_id}", response_model=GenerateStatusResponse, dependencies=[Depends(api_key_guard)])
def generate_status(job_id: str) -> GenerateStatusResponse:
    job = jobs.get(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    result = job.get("result")
    return GenerateStatusResponse(
        job_id=job_id,
        status=job["status"],
        result=GenerateResponse(**result) if result else None,
    )
