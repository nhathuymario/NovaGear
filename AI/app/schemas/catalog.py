from __future__ import annotations

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, Field, HttpUrl


class CatalogDraftStatus(str, Enum):
    QUEUED = "QUEUED"
    PROCESSING = "PROCESSING"
    NEEDS_REVIEW = "NEEDS_REVIEW"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"
    FAILED = "FAILED"


class CatalogSpecificationDraft(BaseModel):
    group_name: str = Field(default="Thông số khác", max_length=120)
    spec_key: str = Field(min_length=1, max_length=180)
    spec_value: str = Field(min_length=1, max_length=1000)
    sort_order: int = Field(default=0, ge=0)


class CatalogVariantDraft(BaseModel):
    sku: str = Field(default="", max_length=120)
    color: str = Field(default="", max_length=100)
    ram: str = Field(default="", max_length=50)
    storage: str = Field(default="", max_length=50)
    version_name: str = Field(default="", max_length=100)
    price: int | None = Field(default=None, ge=0)
    sale_price: int | None = Field(default=None, ge=0)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)


class CatalogSourceEvidence(BaseModel):
    title: str = Field(min_length=1, max_length=500)
    url: HttpUrl
    publisher: str = Field(default="", max_length=200)
    source_type: str = Field(default="search", max_length=50)
    excerpt: str = Field(default="", max_length=1000)
    trust_score: float = Field(default=0.5, ge=0.0, le=1.0)


class PriceObservation(BaseModel):
    seller: str = Field(default="", max_length=200)
    source_url: HttpUrl
    price: int = Field(ge=0)
    currency: str = Field(default="VND", max_length=10)
    condition: str = Field(default="NEW", max_length=30)
    availability: str = Field(default="UNKNOWN", max_length=30)
    match_confidence: float = Field(default=0.5, ge=0.0, le=1.0)


class CatalogProductDraft(BaseModel):
    name: str = Field(min_length=1, max_length=250)
    slug: str = Field(min_length=1, max_length=280)
    brand: str = Field(min_length=1, max_length=150)
    model_number: str = Field(default="", max_length=150)
    gtin: str = Field(default="", max_length=30)
    category_hint: str = Field(default="Khác", max_length=150)
    short_description: str = Field(default="", max_length=500)
    description: str = Field(default="")
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    variants: list[CatalogVariantDraft] = Field(default_factory=list)
    specifications: list[CatalogSpecificationDraft] = Field(default_factory=list)
    sources: list[CatalogSourceEvidence] = Field(default_factory=list)
    price_observations: list[PriceObservation] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class CatalogDraftJobResponse(BaseModel):
    id: str
    status: CatalogDraftStatus
    original_filename: str
    hint: str | None = None
    requested_by: str | None = None
    result: CatalogProductDraft | None = None
    error_message: str | None = None
    approved_product_id: str | None = None
    reviewed_by: str | None = None
    created_at: datetime
    updated_at: datetime
    reviewed_at: datetime | None = None


class CatalogDraftApprovalRequest(BaseModel):
    product_id: str = Field(min_length=1, max_length=100)


class CatalogDraftRejectionRequest(BaseModel):
    reason: str = Field(min_length=3, max_length=1000)


class VisionCatalogExtraction(BaseModel):
    name: str = Field(description="Tên sản phẩm cụ thể nhất có thể xác minh từ ảnh")
    brand: str = Field(description="Thương hiệu nhìn thấy hoặc xác định chắc chắn")
    model_number: str = Field(default="", description="Mã model/MPN nhìn thấy trên ảnh")
    gtin: str = Field(default="", description="GTIN/barcode nếu đọc được, nếu không để trống")
    category_hint: str = Field(default="Khác", description="Danh mục sản phẩm ngắn gọn")
    short_description: str = Field(default="", description="Mô tả ngắn, không thêm thông tin chưa xác minh")
    description: str = Field(default="", description="Mô tả tiếng Việt dựa trên bằng chứng trong ảnh")
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)
    variants: list[CatalogVariantDraft] = Field(default_factory=list)
    specifications: list[CatalogSpecificationDraft] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)
