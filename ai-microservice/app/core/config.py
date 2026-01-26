import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    def __init__(self) -> None:
        self.port = int(os.getenv("PORT", "8000"))
        self.api_key = os.getenv("API_KEY", "")
        self.model_path = os.getenv("MODEL_PATH", "")
        self.log_level = os.getenv("LOG_LEVEL", "INFO")


settings = Settings()
