from pydantic import BaseModel, Field
from typing import Optional, Dict, Any


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
