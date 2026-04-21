from fastapi import APIRouter

from app.core.config import get_settings
from app.schemas.ai import HealthResponse

router = APIRouter()


@router.get("/health")
def health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(
        status="ok",
        service=settings.app_name,
        version=settings.app_version,
        environment=settings.app_env,
        vector_store=settings.default_vector_store,
        search_backend=settings.default_search_backend,
        mock_mode=settings.enable_mock_mode,
    )
