import logging

from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.ai import RagQueryRequest, RagQueryResponse
from app.services.rag_service import RAGService

router = APIRouter()
service = RAGService()
logger = logging.getLogger(__name__)


@router.post("/query")
def query_rag(payload: RagQueryRequest) -> RagQueryResponse:
    settings = get_settings()
    top_k = payload.top_k or settings.rag_top_k
    try:
        return service.answer(payload.question, payload.context, top_k=top_k)
    except Exception as exc:
        logger.exception("RAG query failed", exc_info=exc)
        return RagQueryResponse(
            question=payload.question,
            answer=(
                "Xin lỗi, hệ thống AI đang bận hoặc gặp lỗi tạm thời. "
                "Bạn thử lại sau ít phút nhé."
            ),
            confidence=0.0,
            mode="error-fallback",
            sources=[],
        )
