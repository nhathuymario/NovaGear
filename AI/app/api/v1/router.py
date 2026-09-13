from fastapi import APIRouter

from app.api.v1.health import router as health_router
from app.api.v1.rag import router as rag_router
from app.api.v1.search import router as search_router
from app.api.v1.catalog import router as catalog_router
from app.api.v1.article import router as article_router
from app.api.v1.images import router as images_router

router = APIRouter()
router.include_router(health_router, tags=["health"])
router.include_router(rag_router, prefix="/rag", tags=["rag"])
router.include_router(search_router, prefix="/search", tags=["search"])
router.include_router(catalog_router, prefix="/catalog", tags=["catalog-ai"])
router.include_router(article_router, prefix="/articles", tags=["articles"])
router.include_router(images_router, prefix="/images", tags=["images"])
