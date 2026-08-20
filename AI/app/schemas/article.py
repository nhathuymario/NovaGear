from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field


class ArticleStatus(str, Enum):
    DRAFT = "DRAFT"
    PUBLISHED = "PUBLISHED"


class ArticleTone(str, Enum):
    PROFESSIONAL = "professional"
    CASUAL = "casual"
    REVIEW = "review"
    TUTORIAL = "tutorial"


class ArticleGenerateRequest(BaseModel):
    topic: str = Field(min_length=3, max_length=300, description="Chủ đề bài viết")
    keywords: list[str] = Field(default_factory=list, max_length=10, description="Từ khóa liên quan")
    tone: ArticleTone = Field(default=ArticleTone.PROFESSIONAL, description="Phong cách viết")
    category: str = Field(default="Công nghệ", max_length=100)


class ArticleCreateRequest(BaseModel):
    title: str = Field(min_length=3, max_length=300)
    slug: str = Field(default="", max_length=350)
    summary: str = Field(default="", max_length=600)
    content: str = Field(min_length=10)
    cover_image_url: str = Field(default="", max_length=1000)
    category: str = Field(default="Công nghệ", max_length=100)
    tags: list[str] = Field(default_factory=list, max_length=20)
    status: ArticleStatus = Field(default=ArticleStatus.DRAFT)
    author: str = Field(default="NovaGear AI", max_length=150)


class ArticleUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=3, max_length=300)
    summary: str | None = Field(default=None, max_length=600)
    content: str | None = Field(default=None, min_length=10)
    cover_image_url: str | None = Field(default=None, max_length=1000)
    category: str | None = Field(default=None, max_length=100)
    tags: list[str] | None = Field(default=None, max_length=20)
    status: ArticleStatus | None = None
    author: str | None = Field(default=None, max_length=150)


class ArticleResponse(BaseModel):
    id: str
    title: str
    slug: str
    summary: str
    content: str
    cover_image_url: str
    category: str
    tags: list[str]
    status: ArticleStatus
    author: str
    created_at: datetime
    updated_at: datetime


class ArticleListResponse(BaseModel):
    items: list[ArticleResponse]
    total: int
    page: int
    limit: int
