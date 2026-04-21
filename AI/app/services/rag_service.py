from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence

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
        tokens = _tokenize(question)
        context_tokens = _tokenize(" ".join(context or []))
        query_tokens = tokens | context_tokens

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
        selected_sources = scored_sources[:top_k]

        if selected_sources:
            answer = (
                    "Dựa trên tài liệu nội bộ, câu hỏi của bạn liên quan đến: "
                    + "; ".join(source.title for source in selected_sources)
                    + ". Hãy xem phần trích dẫn để đối chiếu chi tiết."
            )
            confidence = min(1.0, round(sum(source.score for source in selected_sources) / len(selected_sources), 2))
            mode = "mock-rag"
        else:
            answer = (
                "Chưa tìm thấy tài liệu đủ liên quan. Hãy cung cấp thêm ngữ cảnh hoặc ingest thêm source vào vector store."
            )
            confidence = 0.15
            mode = "fallback"

        return RagQueryResponse(
            question=question,
            answer=answer,
            confidence=confidence,
            mode=mode,
            sources=selected_sources,
        )


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
