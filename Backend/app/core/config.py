import os
import urllib.parse
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

def get_default_database_url() -> str:
    if os.environ.get("DATABASE_URL"):
        return os.environ["DATABASE_URL"]
    db_pass = os.environ.get("JUSTENOUGH_DB_PASSWORD")
    db_user = os.environ.get("JUSTENOUGH_DB_USER", "postgres")
    db_name = os.environ.get("JUSTENOUGH_DB_NAME", "justenough")
    db_host = os.environ.get("JUSTENOUGH_DB_HOST", "localhost")
    db_port = os.environ.get("JUSTENOUGH_DB_PORT", "5432")
    if db_pass:
        encoded_pass = urllib.parse.quote_plus(db_pass)
        return f"postgresql://{db_user}:{encoded_pass}@{db_host}:{db_port}/{db_name}"
    return "postgresql://postgres:postgres@localhost:5432/justenough"

class Settings(BaseSettings):
    DATABASE_URL: str = get_default_database_url()
    SECRET_KEY: str = "supersecretkey"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    CORS_ORIGINS: List[str] = ["*"]
    APP_NAME: str = "JustEnough API"
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    model_config = SettingsConfigDict(env_file=".env")

settings = Settings()
