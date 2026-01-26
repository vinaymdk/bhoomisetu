# BhoomiSetu AI Microservice

FastAPI-based AI microservice for the BhoomiSetu NestJS backend. Provides `/generate`, `/health`, and `/metrics` endpoints with safe fallback responses, structured outputs, and optional API key auth.

## Quick Start

```bash
cd ai-microservice
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp env.example .env
uvicorn app.main:app --reload --port 8000
```

## Endpoints

- `GET /health` → `{ "status": "ok" }`
- `POST /generate` → generate response
- `POST /generate/async` → enqueue async job
- `GET /generate/status/{job_id}` → job status and result
- `GET /metrics` → basic in-memory metrics

### Example

```bash
curl -X POST http://localhost:8000/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"Find 2BHK under 50L in Hyderabad"}'
```

## Environment

See `.env.example`.

## Integration (NestJS)

Set `AI_SERVICE_URL=http://localhost:8000` in backend `.env`.  
Backend will call `/generate` via HTTP.

## Tests

```bash
pytest
```

## Docker

```bash
docker build -t bhoomisetu-ai .
docker run -p 8000:8000 --env-file .env bhoomisetu-ai
```
