from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.ai import RagQueryRequest, RagQueryResponse
from app.services.rag_service import RAGService

router = APIRouter()
service = RAGService()


@router.post("/query")
def query_rag(payload: RagQueryRequest) -> RagQueryResponse:
    settings = get_settings()
    top_k = payload.top_k or settings.rag_top_k
    return service.answer(payload.question, payload.context, top_k=top_k)
