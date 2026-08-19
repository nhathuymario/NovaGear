from __future__ import annotations

import json
from datetime import datetime, timezone

from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.models import CatalogDraftJob
from app.schemas.catalog import CatalogDraftJobResponse, CatalogDraftStatus, CatalogProductDraft


class CatalogDraftRepository:
    def __init__(self, session: Session):
        self.session = session

    def add(self, job: CatalogDraftJob) -> CatalogDraftJob:
        self.session.add(job)
        self.session.commit()
        self.session.refresh(job)
        return job

    def get(self, job_id: str) -> CatalogDraftJob | None:
        return self.session.get(CatalogDraftJob, job_id)

    def list_recent(self, limit: int = 50) -> list[CatalogDraftJob]:
        statement = select(CatalogDraftJob).order_by(CatalogDraftJob.created_at.desc()).limit(limit)
        return list(self.session.scalars(statement))

    def update_status(
        self,
        job_id: str,
        status: CatalogDraftStatus,
        *,
        result: CatalogProductDraft | None = None,
        error_message: str | None = None,
    ) -> CatalogDraftJob:
        job = self._require(job_id)
        job.status = status.value
        job.result_json = result.model_dump_json() if result else job.result_json
        job.error_message = error_message
        job.updated_at = datetime.now(timezone.utc)
        self.session.commit()
        self.session.refresh(job)
        return job

    def approve(self, job_id: str, product_id: str, reviewed_by: str | None) -> CatalogDraftJob:
        job = self._require(job_id)
        if job.status != CatalogDraftStatus.NEEDS_REVIEW.value:
            raise ValueError(f"Draft ở trạng thái {job.status}, không thể duyệt")
        job.status = CatalogDraftStatus.APPROVED.value
        job.approved_product_id = product_id
        job.reviewed_by = reviewed_by
        job.reviewed_at = datetime.now(timezone.utc)
        job.updated_at = job.reviewed_at
        self.session.commit()
        self.session.refresh(job)
        return job

    def reject(self, job_id: str, reason: str, reviewed_by: str | None) -> CatalogDraftJob:
        job = self._require(job_id)
        if job.status not in {CatalogDraftStatus.NEEDS_REVIEW.value, CatalogDraftStatus.FAILED.value}:
            raise ValueError(f"Draft ở trạng thái {job.status}, không thể từ chối")
        job.status = CatalogDraftStatus.REJECTED.value
        job.error_message = reason
        job.reviewed_by = reviewed_by
        job.reviewed_at = datetime.now(timezone.utc)
        job.updated_at = job.reviewed_at
        self.session.commit()
        self.session.refresh(job)
        return job

    def _require(self, job_id: str) -> CatalogDraftJob:
        job = self.get(job_id)
        if job is None:
            raise LookupError(job_id)
        return job


def map_job_response(job: CatalogDraftJob) -> CatalogDraftJobResponse:
    result = None
    if job.result_json:
        result = CatalogProductDraft.model_validate(json.loads(job.result_json))

    return CatalogDraftJobResponse(
        id=job.id,
        status=CatalogDraftStatus(job.status),
        original_filename=job.original_filename,
        hint=job.hint,
        requested_by=job.requested_by,
        result=result,
        error_message=job.error_message,
        approved_product_id=job.approved_product_id,
        reviewed_by=job.reviewed_by,
        created_at=job.created_at,
        updated_at=job.updated_at,
        reviewed_at=job.reviewed_at,
    )
