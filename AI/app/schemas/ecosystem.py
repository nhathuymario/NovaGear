from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AiSettingResponse(BaseModel):
    key: str
    value: str
    description: Optional[str]

    class Config:
        from_attributes = True

class AiSettingUpdateRequest(BaseModel):
    value: str

class AiJobResponse(BaseModel):
    id: str
    name: str
    job_type: str
    cron_expression: Optional[str]
    interval_minutes: Optional[int]
    is_active: bool
    config_json: Optional[str]
    last_run_at: Optional[datetime]
    next_run_at: Optional[datetime]
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    run_count: int = 0
    error_count: int = 0
    last_error: Optional[str] = None
    last_result_json: Optional[str] = None

    class Config:
        from_attributes = True

class AiJobCreateRequest(BaseModel):
    name: str
    job_type: str
    cron_expression: Optional[str] = None
    interval_minutes: Optional[int] = None
    is_active: bool = True
    config_json: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class AiJobUpdateRequest(BaseModel):
    name: Optional[str] = None
    cron_expression: Optional[str] = None
    interval_minutes: Optional[int] = None
    is_active: Optional[bool] = None
    config_json: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None

class AiJobLogResponse(BaseModel):
    id: str
    job_id: str
    status: str
    result_json: Optional[str] = None
    error_message: Optional[str] = None
    duration_seconds: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True

class AiDashboardResponse(BaseModel):
    total_jobs: int = 0
    active_jobs: int = 0
    total_drafts: int = 0
    total_articles: int = 0
    recent_logs: list = []
    settings: dict = {}
