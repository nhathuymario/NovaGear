from __future__ import annotations

import logging
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from uuid import uuid4

from app.core.config import get_settings
from app.db.database import SessionLocal
from app.db.models import CatalogDraftJob
from app.repositories.catalog_draft_repository import CatalogDraftRepository
from app.schemas.catalog import CatalogDraftStatus
from app.services.catalog_enrichment_service import CatalogEnrichmentService

logger = logging.getLogger(__name__)
settings = get_settings()
executor = ThreadPoolExecutor(max_workers=settings.ai_job_max_workers, thread_name_prefix="catalog-draft")


class CatalogDraftWorkflow:
    def create_job(
        self,
        *,
        file_bytes: bytes,
        filename: str,
        content_type: str,
        hint: str | None,
        requested_by: str | None,
    ) -> CatalogDraftJob:
        job_id = str(uuid4())
        suffix = _suffix_for_content_type(content_type)
        image_path = Path(settings.ai_upload_dir) / f"{job_id}{suffix}"
        image_path.write_bytes(file_bytes)

        with SessionLocal() as session:
            return CatalogDraftRepository(session).add(
                CatalogDraftJob(
                    id=job_id,
                    status=CatalogDraftStatus.QUEUED.value,
                    original_filename=filename,
                    content_type=content_type,
                    image_path=str(image_path),
                    hint=hint,
                    requested_by=requested_by,
                )
            )

    def submit(self, job_id: str) -> None:
        executor.submit(self.process, job_id)

    def process(self, job_id: str) -> None:
        with SessionLocal() as session:
            repository = CatalogDraftRepository(session)
            try:
                job = repository.update_status(job_id, CatalogDraftStatus.PROCESSING, error_message=None)
                result = CatalogEnrichmentService().analyze(job.image_path, job.content_type, job.hint)
                repository.update_status(job_id, CatalogDraftStatus.NEEDS_REVIEW, result=result, error_message=None)
            except Exception as exc:
                logger.exception("Catalog draft job %s failed", job_id)
                repository.update_status(
                    job_id,
                    CatalogDraftStatus.FAILED,
                    error_message=f"{type(exc).__name__}: {exc}",
                )


def _suffix_for_content_type(content_type: str) -> str:
    return {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/heic": ".heic",
        "image/heif": ".heif",
    }.get(content_type, ".img")
