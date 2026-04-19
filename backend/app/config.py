# backend/app/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    # ── Database ──────────────────────────────────────────────────────────────
    DATABASE_URL: str

    # ── Redis ─────────────────────────────────────────────────────────────────
    REDIS_URL: str

    # ── JWT ───────────────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── App ───────────────────────────────────────────────────────────────────
    APP_ENV: str = "development"

    # Comma-separated origins are parsed into a list automatically
    ALLOWED_ORIGINS: List[str] = ["http://localhost:3000"]

    @property
    def is_production(self) -> bool:
        return self.APP_ENV == "production"


# Singleton — import this everywhere
settings = Settings()
