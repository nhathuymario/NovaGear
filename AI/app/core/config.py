from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "NovaGear AI"
    app_version: str = "0.1.0"
    app_env: str = "development"
    api_v1_prefix: str = "/api/v1"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:3000", "http://localhost:5173"])
    default_vector_store: str = "chroma"
    default_search_backend: str = "meilisearch"
    enable_mock_mode: bool = True
    rag_top_k: int = 5


@lru_cache
def get_settings() -> Settings:
    return Settings()

