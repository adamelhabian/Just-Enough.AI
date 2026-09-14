import os
import urllib.parse
from pydantic import field_validator, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Union

def get_default_database_url() -> str:
    # MVP submission rule: Zero external database required.
    # Default is always standalone local SQLite for zero-setup evaluation.
    if os.environ.get("FORCE_POSTGRES") == "1" and os.environ.get("DATABASE_URL"):
        return os.environ["DATABASE_URL"]
    return "sqlite:///./justenough_mvp.db"

class Settings(BaseSettings):
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DATABASE_URL: str = get_default_database_url()
    SECRET_KEY: str = "supersecretkey"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    CORS_ORIGINS: Union[List[str], str] = ["*"]
    ALLOW_CREDENTIALS: bool = True
    APP_NAME: str = "JustEnough API"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                import json
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return ["*"]

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
