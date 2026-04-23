from functools import lru_cache
import json

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


DEFAULT_CORS_ORIGINS = ["http://localhost:3000", "http://localhost:5173"]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        enable_decoding=False,
    )

    app_name: str = "NovaGear AI"
    app_version: str = "0.1.0"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    cors_origins: list[str] = Field(default_factory=lambda: DEFAULT_CORS_ORIGINS.copy())
    default_vector_store: str = "chroma"
    default_search_backend: str = "meilisearch"
    enable_mock_mode: bool = True
    rag_top_k: int = 5

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: object) -> list[str] | object:
        if value is None:
            return DEFAULT_CORS_ORIGINS.copy()

        if isinstance(value, str):
            raw = value.strip()
            if not raw:
                return DEFAULT_CORS_ORIGINS.copy()

            if raw.startswith("["):
                parsed = json.loads(raw)
                if not isinstance(parsed, list):
                    msg = "CORS_ORIGINS JSON must be an array of strings"
                    raise ValueError(msg)
                return [str(item).strip() for item in parsed if str(item).strip()]

            return [origin.strip() for origin in raw.split(",") if origin.strip()]

        if isinstance(value, (list, tuple, set)):
            return [str(item).strip() for item in value if str(item).strip()]

        return value


@lru_cache
def get_settings() -> Settings:
    return Settings()

