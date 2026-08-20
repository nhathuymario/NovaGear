from fastapi import APIRouter, Header, HTTPException, status
from pydantic import BaseModel
from typing import List

from app.core.config import get_settings
from app.services.article_service import ArticleService

router = APIRouter()
article_service = ArticleService()
settings = get_settings()

class ArticleGenerateRequest(BaseModel):
    topic: str
    keywords: List[str] = []
    tone: str = "Chuyên nghiệp, công nghệ"
    category: str = "Tin tức"

class GeneratedArticleResponse(BaseModel):
    title: str
    summary: str
    content: str
    tags: List[str]
    category: str
    images: List[dict] = []

def _require_admin(role: str | None, authorization: str | None) -> None:
    if role and "ADMIN" in role.upper():
        return
    if settings.app_env.lower() != "production" and authorization and authorization.startswith("Bearer "):
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Yêu cầu quyền ADMIN")

@router.post("/generate", response_model=GeneratedArticleResponse, status_code=status.HTTP_200_OK)
def generate_article(
    payload: ArticleGenerateRequest,
    x_role: str | None = Header(default=None),
    x_username: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
) -> GeneratedArticleResponse:
    _require_admin(x_role, authorization)

    generated = article_service.generate(
        topic=payload.topic,
        keywords=payload.keywords,
        tone=payload.tone,
        category=payload.category,
    )

    return GeneratedArticleResponse(
        title=generated.title,
        summary=generated.summary,
        content=generated.content,
        tags=generated.tags,
        category=generated.category,
        images=generated.images
    )
