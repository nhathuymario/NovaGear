import json
from functools import lru_cache
from pydantic import AliasChoices, Field, field_validator
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
    # Chỉ định dùng chroma làm cơ s dữ liệu vector
    # và meilisearch làm backend tìm kiếm văn bản.
    default_vector_store: str = "chroma"
    default_search_backend: str = "meilisearch"
    # Mock mode nơi bật tắt mock khi cần
    # giả lập dữ liệu
    enable_mock_mode: bool = False
    rag_top_k: int = 5
    gemini_api_key: str | None = Field(default=None, validation_alias=AliasChoices("GEMINI_API_KEY", "GOOGLE_API_KEY"))
    gemini_model: str = "gemini-2.0-flash"
    gemini_base_url: str = "https://generativelanguage.googleapis.com/v1beta"
    gemini_timeout_seconds: float = 20.0
    # cho phép AI search trên google/Bing...
    enable_web_search: bool = True
    # 3 kết quả
    web_search_max_results: int = 3
    # 8 giây
    web_search_timeout_seconds: float = 8.0

    # Field_validator làm sạch dữ liệu trước khi gán vào biến
    @field_validator("cors_origins", mode="before")
    @classmethod
    # hàm này biến các chuỗi string thành các list
    # vd: "http://localhost:3000, http://localhost:5173" => ["http://localhost:3000", "http://localhost:5173"]
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

    # lọc các api key rác
    # nếu key trống hoặc các các chuỗi str hàm này sẽ auto trả none giúp hệ thống đưa ra lỗi
    @field_validator("gemini_api_key", mode="before")
    @classmethod
    def normalize_gemini_api_key(cls, value: object) -> str | None | object:
        if value is None:
            return None

        if isinstance(value, str):
            normalized = value.strip()
            if not normalized:
                return None

            # Common placeholder values should be treated as unset keys.
            if normalized.lower() in {"str", "your_gemini_api_key_here", "changeme"}:
                return None

            return normalized

        return value


# hàm decorator của python dùng để ghi nhớ kết quả(cache)
# khi phân tích một cú pháp dữ liệu sẽ lưu trữ vào cache(RAM)
# ở các lần khi code gọi get_setting() python sẽ lập tức trả về đối tượng có sẵn
@lru_cache
def get_settings() -> Settings:
    return Settings()
