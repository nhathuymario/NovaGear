from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.ai import SearchRequest, SearchResponse
from app.services.search_service import SearchService

router = APIRouter()
service = SearchService()


@router.post("/suggest")
def suggest(payload: SearchRequest) -> SearchResponse:
    settings = get_settings()
    return service.suggest(payload.query, payload.limit, backend=settings.default_search_backend)


@router.post("/semantic")
def semantic_search(payload: SearchRequest) -> SearchResponse:
    settings = get_settings()
    return service.semantic_search(payload.query, payload.limit, backend=settings.default_search_backend)
