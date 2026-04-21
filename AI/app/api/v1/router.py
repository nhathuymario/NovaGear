from fastapi import APIRouter

from app.api.v1.health import router as health_router
from app.api.v1.rag import router as rag_router
from app.api.v1.search import router as search_router

router = APIRouter()
router.include_router(health_router, tags=["health"])
router.include_router(rag_router, prefix="/rag", tags=["rag"])
router.include_router(search_router, prefix="/search", tags=["search"])
