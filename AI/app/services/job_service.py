"""AI Job Scheduler — Quản lý lịch trình chạy tự động các AI jobs."""
from __future__ import annotations

import logging
import threading
import time
from datetime import datetime, timezone

from app.db.database import SessionLocal
from app.db.models import AiJob

logger = logging.getLogger(__name__)

_scheduler_thread: threading.Thread | None = None
_stop_event = threading.Event()


def start_scheduler() -> None:
    """Khởi động scheduler chạy background, check jobs mỗi 30 giây."""
    global _scheduler_thread
    if _scheduler_thread and _scheduler_thread.is_alive():
        logger.info("Scheduler already running")
        return

    _stop_event.clear()
    _scheduler_thread = threading.Thread(target=_scheduler_loop, daemon=True, name="ai-job-scheduler")
    _scheduler_thread.start()
    logger.info("AI Job Scheduler started")


def stop_scheduler() -> None:
    """Dừng scheduler."""
    _stop_event.set()
    logger.info("AI Job Scheduler stopped")


def _scheduler_loop() -> None:
    """Vòng lặp chính — check jobs cần chạy mỗi 30 giây."""
    logger.info("Scheduler loop started")
    while not _stop_event.is_set():
        try:
            _check_and_run_jobs()
        except Exception as exc:
            logger.exception("Scheduler iteration error: %s", exc)
        _stop_event.wait(timeout=30)


def _check_and_run_jobs() -> None:
    """Kiểm tra và thực thi các jobs đến lịch."""
    now = datetime.now(timezone.utc)
    with SessionLocal() as db:
        jobs = db.query(AiJob).filter(AiJob.is_active == True).all()

        for job in jobs:
            # Kiểm tra start_date
            if job.start_date:
                job_start = job.start_date.replace(tzinfo=timezone.utc) if job.start_date.tzinfo is None else job.start_date
                if now < job_start:
                    continue
            # Kiểm tra end_date
            if job.end_date:
                job_end = job.end_date.replace(tzinfo=timezone.utc) if job.end_date.tzinfo is None else job.end_date
                if now > job_end:
                    continue

            if _should_run(job, now):
                logger.info("Triggering job: %s (%s)", job.name, job.id)
                from app.services.job_executor import execute_job
                thread = threading.Thread(
                    target=execute_job, args=(job.id,), daemon=True,
                    name=f"job-{job.id[:8]}"
                )
                thread.start()


def _should_run(job: AiJob, now: datetime) -> bool:
    """Xác định xem job có cần chạy tại thời điểm hiện tại không."""
    if not job.interval_minutes and not job.cron_expression:
        return False

    # Interval-based scheduling
    if job.interval_minutes:
        if not job.last_run_at:
            return True
        last_run = job.last_run_at.replace(tzinfo=timezone.utc) if job.last_run_at.tzinfo is None else job.last_run_at
        elapsed_minutes = (now - last_run).total_seconds() / 60
        return elapsed_minutes >= job.interval_minutes

    # Cron-based scheduling (simple implementation)
    if job.cron_expression:
        last_run = job.last_run_at.replace(tzinfo=timezone.utc) if (job.last_run_at and job.last_run_at.tzinfo is None) else job.last_run_at
        return _cron_matches(job.cron_expression, now, last_run)

    return False


def _cron_matches(expression: str, now: datetime, last_run: datetime | None) -> bool:
    """Kiểm tra đơn giản cron expression (minute hour day month weekday)."""
    parts = expression.strip().split()
    if len(parts) != 5:
        return False

    minute, hour, day, month, weekday = parts

    def matches(field: str, value: int) -> bool:
        if field == "*":
            return True
        if field.startswith("*/"):
            step = int(field[2:])
            return value % step == 0
        try:
            return int(field) == value
        except ValueError:
            return False

    if not all([
        matches(minute, now.minute),
        matches(hour, now.hour),
        matches(day, now.day),
        matches(month, now.month),
        matches(weekday, now.weekday()),
    ]):
        return False

    # Tránh chạy lại trong cùng phút
    if last_run:
        if (now - last_run).total_seconds() < 60:
            return False

    return True
