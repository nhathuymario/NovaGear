from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
    vector_store: str
    search_backend: str
    mock_mode: bool


class RagQueryRequest(BaseModel):
    question: str = Field(min_length=3, max_length=2000)
    context: list[str] = Field(default_factory=list)
    top_k: int | None = Field(default=None, ge=1, le=10)


class RagSource(BaseModel):
    title: str
    excerpt: str
    score: float = Field(ge=0.0, le=1.0)


class RagQueryResponse(BaseModel):
    question: str
    answer: str
    confidence: float = Field(ge=0.0, le=1.0)
    mode: str
    sources: list[RagSource]


class SearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=500)
    limit: int = Field(default=5, ge=1, le=10)


class SearchResult(BaseModel):
    title: str
    excerpt: str
    score: float = Field(ge=0.0, le=1.0)
    reason: str


class SearchResponse(BaseModel):
    query: str
    backend: str
    results: list[SearchResult]

