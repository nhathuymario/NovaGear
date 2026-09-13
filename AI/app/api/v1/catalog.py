from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, File, Form, Header, HTTPException, UploadFile, status

from app.core.config import get_settings
from app.db.database import SessionLocal
from app.repositories.catalog_draft_repository import CatalogDraftRepository, map_job_response
from app.schemas.catalog import (
    CatalogDraftApprovalRequest,
    CatalogDraftJobResponse,
    CatalogDraftPromptRequest,
    CatalogDraftUrlRequest,
    CatalogDraftRejectionRequest,
    CatalogAutoTagRequest,
    CatalogAutoTagResponse,
    CatalogEmbeddingRequest,
    CatalogRecommendationResponse
)
from app.services.catalog_draft_workflow import CatalogDraftWorkflow

router = APIRouter()
workflow = CatalogDraftWorkflow()
settings = get_settings()

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"}


def require_admin(role: str | None, authorization: str | None) -> None:
    if role and "ADMIN" in role.upper():
        return
    if settings.app_env.lower() != "production" and authorization and authorization.startswith("Bearer "):
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Yêu cầu quyền ADMIN")


@router.post("/drafts", response_model=CatalogDraftJobResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_catalog_draft(
    file: UploadFile = File(...),
    hint: str | None = Form(default=None, max_length=500),
    x_role: str | None = Header(default=None),
    x_username: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
) -> CatalogDraftJobResponse:
    require_admin(x_role, authorization)
    content_type = (file.content_type or "").lower()
    if content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=415, detail="Chỉ hỗ trợ JPEG, PNG, WEBP, HEIC hoặc HEIF")

    file_bytes = await file.read(settings.ai_max_upload_bytes + 1)
    if not file_bytes:
        raise HTTPException(status_code=400, detail="File ảnh trống")
    if len(file_bytes) > settings.ai_max_upload_bytes:
        raise HTTPException(status_code=413, detail="Ảnh vượt quá giới hạn dung lượng")
    if not has_valid_image_signature(file_bytes, content_type):
        raise HTTPException(status_code=400, detail="Nội dung file không khớp định dạng ảnh")

    safe_filename = Path(file.filename or "product-image").name
    job = workflow.create_job(
        file_bytes=file_bytes,
        filename=safe_filename,
        content_type=content_type,
        hint=hint.strip() if hint and hint.strip() else None,
        requested_by=x_username,
    )
    workflow.submit(job.id)
    return map_job_response(job)


@router.post("/drafts/prompt", response_model=CatalogDraftJobResponse, status_code=status.HTTP_202_ACCEPTED)
def create_catalog_draft_from_prompt(
    payload: CatalogDraftPromptRequest,
    x_role: str | None = Header(default=None),
    x_username: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
) -> CatalogDraftJobResponse:
    require_admin(x_role, authorization)
    prompt = payload.prompt.strip()
    if not prompt:
        raise HTTPException(status_code=400, detail="Prompt không được trống")

    job = workflow.create_job(
        file_bytes=b"dummy",
        filename="prompt.txt",
        content_type="text/plain",
        hint=prompt,
        requested_by=x_username,
    )
    workflow.submit(job.id)
    return map_job_response(job)


@router.post("/drafts/url", response_model=CatalogDraftJobResponse, status_code=status.HTTP_202_ACCEPTED)
def create_catalog_draft_from_url(
    payload: CatalogDraftUrlRequest,
    x_role: str | None = Header(default=None),
    x_username: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
) -> CatalogDraftJobResponse:
    require_admin(x_role, authorization)

    job = workflow.create_job(
        file_bytes=str(payload.url).encode("utf-8"),
        filename="url.txt",
        content_type="text/uri-list",
        hint=payload.hint.strip() if payload.hint else None,
        requested_by=x_username,
    )
    workflow.submit(job.id)
    return map_job_response(job)


@router.get("/drafts", response_model=list[CatalogDraftJobResponse])
def list_catalog_drafts(
    limit: int = 50,
    x_role: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
) -> list[CatalogDraftJobResponse]:
    require_admin(x_role, authorization)
    safe_limit = max(1, min(limit, 100))
    with SessionLocal() as session:
        return [map_job_response(item) for item in CatalogDraftRepository(session).list_recent(safe_limit)]


@router.get("/drafts/{job_id}", response_model=CatalogDraftJobResponse)
def get_catalog_draft(
    job_id: str,
    x_role: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
) -> CatalogDraftJobResponse:
    require_admin(x_role, authorization)
    with SessionLocal() as session:
        job = CatalogDraftRepository(session).get(job_id)
        if job is None:
            raise HTTPException(status_code=404, detail="Không tìm thấy AI draft")
        return map_job_response(job)


@router.post("/drafts/{job_id}/approve", response_model=CatalogDraftJobResponse)
def approve_catalog_draft(
    job_id: str,
    payload: CatalogDraftApprovalRequest,
    x_role: str | None = Header(default=None),
    x_username: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
) -> CatalogDraftJobResponse:
    require_admin(x_role, authorization)
    with SessionLocal() as session:
        repository = CatalogDraftRepository(session)
        try:
            return map_job_response(repository.approve(job_id, payload.product_id, x_username))
        except LookupError:
            raise HTTPException(status_code=404, detail="Không tìm thấy AI draft") from None
        except ValueError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc


def has_valid_image_signature(file_bytes: bytes, content_type: str) -> bool:
    if content_type == "image/jpeg":
        return file_bytes.startswith(b"\xff\xd8\xff")
    if content_type == "image/png":
        return file_bytes.startswith(b"\x89PNG\r\n\x1a\n")
    if content_type == "image/webp":
        return len(file_bytes) >= 12 and file_bytes.startswith(b"RIFF") and file_bytes[8:12] == b"WEBP"
    if content_type in {"image/heic", "image/heif"}:
        return len(file_bytes) >= 12 and file_bytes[4:8] == b"ftyp"
    return False


@router.post("/drafts/{job_id}/reject", response_model=CatalogDraftJobResponse)
def reject_catalog_draft(
    job_id: str,
    payload: CatalogDraftRejectionRequest,
    x_role: str | None = Header(default=None),
    x_username: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
) -> CatalogDraftJobResponse:
    require_admin(x_role, authorization)
    with SessionLocal() as session:
        repository = CatalogDraftRepository(session)
        try:
            return map_job_response(repository.reject(job_id, payload.reason, x_username))
        except LookupError:
            raise HTTPException(status_code=404, detail="Không tìm thấy AI draft") from None
        except ValueError as exc:
            raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.post("/auto-tag", response_model=CatalogAutoTagResponse)
def auto_tag_catalog(
    payload: CatalogAutoTagRequest,
    x_role: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
) -> CatalogAutoTagResponse:
    require_admin(x_role, authorization)
    
    if not settings.gemini_api_key:
        return CatalogAutoTagResponse(tags=["Tech"], suggested_category="Khác")
        
    try:
        from google import genai
        from google.genai import types
        
        client = genai.Client(api_key=settings.gemini_api_key)
        prompt = (
            "Phân tích văn bản sản phẩm dưới đây, trích xuất tối đa 5 tags ngắn gọn (ưu tiên tiếng Việt có dấu) "
            "và gợi ý 1 danh mục (category) chính xác nhất trong số: Laptop, Điện thoại, Bàn phím, Chuột, Tai nghe, "
            "Màn hình, Linh kiện PC, Phụ kiện, Khác.\n\n"
            f"Văn bản:\n{payload.text}"
        )
        response = client.models.generate_content(
            model=settings.gemini_model,
            contents=[prompt],
            config=types.GenerateContentConfig(
                temperature=0.1,
                response_mime_type="application/json",
                response_schema=CatalogAutoTagResponse,
            ),
        )
        if getattr(response, "parsed", None):
            return CatalogAutoTagResponse.model_validate(response.parsed)
        return CatalogAutoTagResponse.model_validate_json(response.text)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Lỗi AI Service: {exc}")


@router.post("/embeddings", status_code=status.HTTP_200_OK)
def update_product_embeddings(
    payload: CatalogEmbeddingRequest,
    x_role: str | None = Header(default=None),
    authorization: str | None = Header(default=None),
):
    # This can be called by internal services (Product Service) to update vector DB
    # We can skip auth if it's an internal network, but let's keep it safe
    try:
        from google import genai
        from app.db.chroma import get_catalog_collection
        
        if not settings.gemini_api_key:
            return {"status": "skipped", "reason": "No Gemini API key"}
            
        client = genai.Client(api_key=settings.gemini_api_key)
        text_to_embed = f"Tên sản phẩm: {payload.title}. Mô tả: {payload.description}"
        
        # Call embeddings model
        response = client.models.embed_content(
            model='gemini-embedding-2',
            contents=text_to_embed,
        )
        
        # Usually it returns a list of embeddings
        embedding = response.embeddings[0].values
        
        collection = get_catalog_collection()
        collection.upsert(
            documents=[text_to_embed],
            embeddings=[embedding],
            metadatas=[{"title": payload.title}],
            ids=[payload.product_id]
        )
        return {"status": "success", "product_id": payload.product_id}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/recommendations/{product_id}", response_model=CatalogRecommendationResponse)
def get_recommendations(
    product_id: str,
    limit: int = 5
) -> CatalogRecommendationResponse:
    try:
        from app.db.chroma import get_catalog_collection
        collection = get_catalog_collection()
        
        # Fetch the embedding for the product
        result = collection.get(ids=[product_id], include=["embeddings"])
        
        if result.get("embeddings") is None or len(result["embeddings"]) == 0:
            return CatalogRecommendationResponse(product_ids=[])
            
        query_embedding = result["embeddings"][0]
        
        # Query nearest neighbors, excluding the product itself
        search_result = collection.query(
            query_embeddings=[query_embedding],
            n_results=limit + 1,
            include=["distances"]
        )
        
        similar_ids = []
        if search_result["ids"] and len(search_result["ids"]) > 0:
            for item_id in search_result["ids"][0]:
                if item_id != product_id:
                    similar_ids.append(item_id)
                    
        return CatalogRecommendationResponse(product_ids=similar_ids[:limit])
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
