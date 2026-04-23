from __future__ import annotations

import json
from dataclasses import dataclass
from urllib import error, parse, request
from typing import Sequence

from app.core.config import get_settings
from app.schemas.ai import RagQueryResponse, RagSource


@dataclass(frozen=True)
class KnowledgeDocument:
    title: str
    content: str
    keywords: tuple[str, ...]


_KNOWLEDGE_BASE: tuple[KnowledgeDocument, ...] = (
    KnowledgeDocument(
        title="NovaGear Overview",
        content="NovaGear is built as a microservices platform with a React frontend, Spring Boot services, and an AI service for RAG and semantic search.",
        keywords=("novagear", "architecture", "microservices", "react", "spring", "ai"),
    ),
    KnowledgeDocument(
        title="Product Discovery",
        content="The AI service can enrich product discovery with semantic search, smart suggestions, and question answering over product or policy documents.",
        keywords=("product", "search", "suggestion", "semantic", "discover"),
    ),
    KnowledgeDocument(
        title="Support Knowledge Base",
        content="RAG should ingest FAQs, warranty policy, shipping policy, and product manuals so customer questions can be answered consistently.",
        keywords=("faq", "policy", "manual", "warranty", "shipping", "support"),
    ),
)


class RAGService:
    def answer(self, question: str, context: Sequence[str] | None = None, top_k: int = 5) -> RagQueryResponse:
        settings = get_settings()
        safe_top_k = max(1, min(top_k, 10))
        tokens = _tokenize(question)
        context_tokens = _tokenize(" ".join(context or []))
        query_tokens = tokens | context_tokens

        selected_sources = self._select_sources(query_tokens, safe_top_k)

        if settings.enable_mock_mode or not settings.gemini_api_key:
            return RagQueryResponse(
                question=question,
                answer=self._build_mock_answer(selected_sources),
                confidence=self._confidence_from_sources(selected_sources, gemini=False),
                mode="mock-rag",
                sources=selected_sources,
            )

        try:
            answer = self._generate_with_gemini(question, context or [], selected_sources, settings)
            mode = "gemini"
            confidence = self._confidence_from_sources(selected_sources, gemini=True)
        except Exception:
            answer = self._build_mock_answer(selected_sources)
            mode = "fallback"
            confidence = self._confidence_from_sources(selected_sources, gemini=False)

        return RagQueryResponse(
            question=question,
            answer=answer,
            confidence=confidence,
            mode=mode,
            sources=selected_sources,
        )

    def _select_sources(self, query_tokens: set[str], top_k: int) -> list[RagSource]:
        scored_sources: list[RagSource] = []
        for document in _KNOWLEDGE_BASE:
            score = _score_document(query_tokens, document)
            if score <= 0:
                continue
            scored_sources.append(
                RagSource(
                    title=document.title,
                    excerpt=document.content[:240],
                    score=round(score, 2),
                )
            )

        scored_sources.sort(key=lambda item: item.score, reverse=True)
        return scored_sources[:top_k]

    def _build_mock_answer(self, selected_sources: Sequence[RagSource]) -> str:
        if selected_sources:
            return (
                "Dựa trên tài liệu nội bộ, câu hỏi của bạn liên quan đến: "
                + "; ".join(source.title for source in selected_sources)
                + ". Hãy xem phần trích dẫn để đối chiếu chi tiết."
            )

        return (
            "Chưa tìm thấy tài liệu đủ liên quan. Hãy cung cấp thêm ngữ cảnh hoặc ingest thêm source vào vector store."
        )

    def _confidence_from_sources(self, selected_sources: Sequence[RagSource], *, gemini: bool) -> float:
        if not selected_sources:
            return 0.35 if gemini else 0.15

        average_score = sum(source.score for source in selected_sources) / len(selected_sources)
        if gemini:
            return min(1.0, round(0.55 + average_score * 0.45, 2))

        return min(1.0, round(average_score, 2))

    def _generate_with_gemini(
        self,
        question: str,
        context: Sequence[str],
        selected_sources: Sequence[RagSource],
        settings,
    ) -> str:
        prompt = self._build_prompt(question, context, selected_sources)
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}],
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "topP": 0.95,
                "maxOutputTokens": 512,
            },
        }

        url = f"{settings.gemini_base_url.rstrip('/')}/models/{settings.gemini_model}:generateContent"
        query_string = parse.urlencode({"key": settings.gemini_api_key})
        body = json.dumps(payload).encode("utf-8")
        http_request = request.Request(
            f"{url}?{query_string}",
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with request.urlopen(http_request, timeout=settings.gemini_timeout_seconds) as response:
                response_payload = json.loads(response.read().decode("utf-8"))
        except error.HTTPError as exc:
            response_payload = json.loads(exc.read().decode("utf-8")) if exc.fp else {"error": {"message": str(exc)}}

        return self._extract_gemini_text(response_payload)

    def _build_prompt(
        self,
        question: str,
        context: Sequence[str],
        selected_sources: Sequence[RagSource],
    ) -> str:
        source_lines = [
            f"- {index}. {source.title}: {source.excerpt} (score={source.score})"
            for index, source in enumerate(selected_sources, start=1)
        ]
        context_text = "\n".join(f"- {item}" for item in context) if context else "- Không có ngữ cảnh bổ sung"
        sources_text = "\n".join(source_lines) if source_lines else "- Không có nguồn nào khớp"

        return (
            "Bạn là trợ lý AI của NovaGear. Hãy trả lời bằng tiếng Việt, ngắn gọn, rõ ràng và thực tế. "
            "Ưu tiên sử dụng các nguồn tham chiếu bên dưới. Nếu thông tin chưa đủ, hãy nói rõ là chưa đủ dữ liệu thay vì bịa.\n\n"
            f"Câu hỏi: {question}\n\n"
            f"Ngữ cảnh bổ sung:\n{context_text}\n\n"
            f"Nguồn tham chiếu:\n{sources_text}\n\n"
            "Hãy trả lời ngay dưới đây:"
        )

    def _extract_gemini_text(self, payload: dict) -> str:
        candidates = payload.get("candidates") or []
        for candidate in candidates:
            content = candidate.get("content") or {}
            parts = content.get("parts") or []
            texts = [str(part.get("text", "")).strip() for part in parts if str(part.get("text", "")).strip()]
            if texts:
                return "\n".join(texts).strip()

        error_message = payload.get("error", {}).get("message")
        if error_message:
            raise RuntimeError(error_message)

        raise RuntimeError("Gemini response did not contain any text content")


def _tokenize(value: str) -> set[str]:
    tokens = set()
    for token in value.lower().replace("/", " ").replace("-", " ").replace(",", " ").split():
        cleaned = "".join(char for char in token if char.isalnum())
        if cleaned:
            tokens.add(cleaned)
    return tokens


def _score_document(query_tokens: set[str], document: KnowledgeDocument) -> float:
    if not query_tokens:
        return 0.0
    keyword_tokens = set(document.keywords)
    matched = len(query_tokens & keyword_tokens)
    if matched == 0:
        return 0.0
    return matched / max(len(keyword_tokens), len(query_tokens))
