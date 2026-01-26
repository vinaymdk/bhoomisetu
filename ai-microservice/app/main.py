from fastapi import FastAPI
from .api.routes import router

app = FastAPI(title="BhoomiSetu AI Microservice", version="1.0.0")
app.include_router(router)
