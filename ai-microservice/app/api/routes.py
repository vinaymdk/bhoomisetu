import time
from typing import Dict, Any
from fastapi import APIRouter, HTTPException, Depends, Header, BackgroundTasks
from ..schemas import GenerateRequest, GenerateResponse, GenerateAsyncResponse, GenerateStatusResponse
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
