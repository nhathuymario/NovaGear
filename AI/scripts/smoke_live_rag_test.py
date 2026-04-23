from __future__ import annotations

import json
import os
import sys
from dataclasses import dataclass
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from app.core.config import get_settings
from app.services import rag_service
from app.services.rag_service import RAGService


@dataclass
class FakeResponse:
    body: str

    def read(self) -> bytes:
        return self.body.encode("utf-8")

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False



def fake_urlopen(req, timeout=None):
    url = getattr(req, "full_url", str(req))
    if "duckduckgo" in url:
        return FakeResponse(
            '<a class="result__a" href="https://novagear.vn/policies/bao-hanh">Chính sách bảo hành</a>'
            '<div class="result__snippet">Bảo hành 12 tháng cho sản phẩm.</div>'
        )
    if "generativelanguage.googleapis.com" in url:
        return FakeResponse(
            json.dumps(
                {
                    "candidates": [
                        {
                            "content": {
                                "parts": [
                                    {"text": "Gemini OK: chính sách bảo hành áp dụng theo cửa hàng."}
                                ]
                            }
                        }
                    ]
                },
                ensure_ascii=False,
            )
        )
    raise AssertionError(f"Unexpected URL: {url}")


if __name__ == "__main__":
    os.environ["ENABLE_MOCK_MODE"] = "false"
    os.environ["GEMINI_API_KEY"] = "abc123"
    os.environ["ENABLE_WEB_SEARCH"] = "true"
    os.environ["WEB_SEARCH_MAX_RESULTS"] = "3"
    os.environ["WEB_SEARCH_TIMEOUT_SECONDS"] = "8"
    get_settings.cache_clear()

    rag_service.request.urlopen = fake_urlopen

    settings = get_settings()
    print(
        {
            "enable_mock_mode": settings.enable_mock_mode,
            "gemini_api_key": bool(settings.gemini_api_key),
            "enable_web_search": settings.enable_web_search,
        }
    )

    result = RAGService().answer(
        "Chính sách bảo hành của shop là gì?",
        ["Chinh sach bao hanh cua shop la gi?"],
        top_k=5,
    )
    print(json.dumps(result.model_dump(), ensure_ascii=False, indent=2))


