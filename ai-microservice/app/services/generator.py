import time
import uuid
from typing import Dict, Any


def generate_text(prompt: str) -> Dict[str, Any]:
    start = time.time()
    content = prompt.strip()
    response_text = (
        f"I can help with your request: {content}. "
        "Please share location, budget, and property type for better results."
    )
    latency_ms = int((time.time() - start) * 1000)
    return {
        "response": response_text,
        "confidence": 0.72,
        "model": "local-fallback",
        "structured": {
            "summary": "Property assistance response",
            "intent": "property_search",
        },
        "latency_ms": latency_ms,
    }


def generate_job_id() -> str:
    return str(uuid.uuid4())
