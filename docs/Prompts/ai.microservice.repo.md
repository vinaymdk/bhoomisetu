I want to create an AI microservice repo(latest-version) to integrate with this existing NestJS project. The microservice should have the following specifications:

1. **Framework & Language**:
   - Python (FastAPI) or Node.js (Express/NestJS-compatible) for AI endpoints
   - Should be easy to run locally and in production
   - Use latest stable versions of all dependencies
   - Dockerfile for containerization
   - Basic unit tests for endpoints
   - Linting and formatting setup (e.g., ESLint/Prettier for JS, Black/Flake8 for Python)
   - README.md with setup and run instructions

2. **Endpoints**:
   - POST /generate : Accepts a JSON payload with a 'prompt' string and returns AI-generated text
   - GET /health : Returns service status (OK / Error)
   - Optional: GET /metrics : For logging and monitoring AI calls

3. **Features**:
   - Configurable via `.env` file:
       - PORT (default: 8000)
       - API_KEY (optional)
       - MODEL_PATH (if using local models)
   - Fallback responses if the AI model fails
   - Logging of requests/responses with timestamps
   - Returns confidence scores and structured answers
   - Mediation-first design: ensure no sensitive data leaks
   - Support for both synchronous and asynchronous AI calls

4. **Integration Requirements**:
   - Should be callable via HTTP from my NestJS backend
   - Easy to test with Postman / curl
   - Dockerfile included for containerized deployment
   - Instructions for integrating with existing NestJS project

5. **Project Structure**:
   - README.md with installation, run, and integration instructions
   - requirements.txt or package.json depending on language
   - Modular code structure with AI service logic separated

6. **Optional Enhancements**:
   - Support multiple AI models (switchable via .env)
   - Retry logic on failed AI calls
   - Swagger / OpenAPI docs

7. **Documentation**:
   - Provide comprehensive documentation for the repository.
   - Include setup instructions, API documentation, and usage examples.
   - Update ./docs/Prompts/ai.microservice.repo.md with all the changes you made

Generate a ready-to-use Git repository structure and code that I can clone and directly integrate with my current NestJS project, where the AI microservice runs on http://localhost:8000 by default.

## Implementation Notes (2026-01-26)
- Created `ai-microservice/` FastAPI repo inside the main workspace with:
  - `app/` (main, routes, schemas, generator, config)
  - `requirements.txt`, `requirements-dev.txt`
  - `Dockerfile`, `pyproject.toml`, `.github/workflows/ci.yml`
  - `tests/` for health + generate endpoints
  - `README.md` + `env.example`
- Endpoints added:
  - `GET /health`, `POST /generate`, `POST /generate/async`, `GET /generate/status/{job_id}`, `GET /metrics`
- Optional API key via `X-API-Key` header when `API_KEY` is set.
- Added fallback response logic and structured output.
- Integration: set backend `AI_SERVICE_URL=http://localhost:8000`.
