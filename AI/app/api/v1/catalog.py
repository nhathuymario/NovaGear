from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, File, Form, Header, HTTPException, UploadFile, status

from app.core.config import get_settings
from app.db.database import SessionLocal
from app.repositories.catalog_draft_repository import CatalogDraftRepository, map_job_response
from app.schemas.catalog import (
    CatalogDraftApprovalRequest,
    CatalogDraftJobResponse,
    CatalogDraftRejectionRequest,
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
