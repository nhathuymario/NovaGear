import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timezone

from app.db.database import get_database_session
from app.db.models import AiSetting, AiJob, AiJobLog
from app.schemas.ecosystem import (
    AiSettingResponse, AiSettingUpdateRequest, 
    AiJobResponse, AiJobCreateRequest, AiJobUpdateRequest,
    AiJobLogResponse, AiDashboardResponse
)

router = APIRouter()

# Settings API
@router.get("/settings", response_model=List[AiSettingResponse])
def get_settings(db: Session = Depends(get_database_session)):
    return db.query(AiSetting).all()

@router.put("/settings/{key}", response_model=AiSettingResponse)
def update_setting(key: str, req: AiSettingUpdateRequest, db: Session = Depends(get_database_session)):
    setting = db.query(AiSetting).filter(AiSetting.key == key).first()
    if not setting:
        # Auto-create if not exists
        setting = AiSetting(key=key, value=req.value, description="")
        db.add(setting)
    else:
        setting.value = req.value
    db.commit()
    db.refresh(setting)
    return setting

# Jobs API
@router.get("/jobs", response_model=List[AiJobResponse])
def get_jobs(db: Session = Depends(get_database_session)):
    return db.query(AiJob).all()

@router.post("/jobs", response_model=AiJobResponse)
def create_job(req: AiJobCreateRequest, db: Session = Depends(get_database_session)):
    job_id = str(uuid.uuid4())
    job = AiJob(
        id=job_id,
        name=req.name,
        job_type=req.job_type,
        cron_expression=req.cron_expression,
        interval_minutes=req.interval_minutes,
        is_active=req.is_active,
        config_json=req.config_json,
        start_date=req.start_date,
        end_date=req.end_date,
    )
    db.add(job)
    db.commit()
    db.refresh(job)
    return job

@router.put("/jobs/{job_id}", response_model=AiJobResponse)
def update_job(job_id: str, req: AiJobUpdateRequest, db: Session = Depends(get_database_session)):
    job = db.query(AiJob).filter(AiJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    if req.name is not None: job.name = req.name
    if req.cron_expression is not None: job.cron_expression = req.cron_expression
    if req.interval_minutes is not None: job.interval_minutes = req.interval_minutes
    if req.is_active is not None: job.is_active = req.is_active
    if req.config_json is not None: job.config_json = req.config_json
    if req.start_date is not None: job.start_date = req.start_date
    if req.end_date is not None: job.end_date = req.end_date
    
    db.commit()
    db.refresh(job)
    return job

@router.delete("/jobs/{job_id}")
def delete_job(job_id: str, db: Session = Depends(get_database_session)):
    job = db.query(AiJob).filter(AiJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    db.delete(job)
    db.commit()
    return {"detail": "Job deleted"}

# Run a job immediately
@router.post("/jobs/{job_id}/run-now")
def run_job_now(job_id: str, db: Session = Depends(get_database_session)):
    job = db.query(AiJob).filter(AiJob.id == job_id).first()
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    from app.services.job_executor import execute_job
    import threading
    thread = threading.Thread(target=execute_job, args=(job_id,), daemon=True)
    thread.start()
    return {"detail": "Job đã được kích hoạt", "job_id": job_id}

# Get job logs
@router.get("/jobs/{job_id}/logs", response_model=List[AiJobLogResponse])
def get_job_logs(job_id: str, limit: int = 20, db: Session = Depends(get_database_session)):
    logs = db.query(AiJobLog).filter(AiJobLog.job_id == job_id).order_by(AiJobLog.created_at.desc()).limit(limit).all()
    return logs

# Dashboard stats
@router.get("/dashboard", response_model=AiDashboardResponse)
def get_dashboard(db: Session = Depends(get_database_session)):
    from app.db.models import CatalogDraftJob, Article
    total_jobs = db.query(AiJob).count()
    active_jobs = db.query(AiJob).filter(AiJob.is_active == True).count()
    total_drafts = db.query(CatalogDraftJob).count()
    total_articles = db.query(Article).count()
    recent_logs = db.query(AiJobLog).order_by(AiJobLog.created_at.desc()).limit(10).all()
    settings_list = db.query(AiSetting).all()
    settings_map = {s.key: s.value for s in settings_list}
    return AiDashboardResponse(
        total_jobs=total_jobs,
        active_jobs=active_jobs,
        total_drafts=total_drafts,
        total_articles=total_articles,
        recent_logs=[{"id": l.id, "job_id": l.job_id, "status": l.status, "created_at": str(l.created_at), "error_message": l.error_message, "duration_seconds": l.duration_seconds} for l in recent_logs],
        settings=settings_map
    )
