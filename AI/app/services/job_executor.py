"""AI Job Executor — Thực thi các tác vụ AI tự động."""
from __future__ import annotations

import json
import logging
import time
import uuid
import urllib.request
import urllib.error
from datetime import datetime, timezone

from app.core.config import get_settings
from app.db.database import SessionLocal
from app.db.models import AiJob, AiJobLog, AiSetting

logger = logging.getLogger(__name__)
settings = get_settings()

API_PRODUCT_URL = "http://localhost:8083"
API_ARTICLE_URL = "http://localhost:8091"
ADMIN_HEADERS = {
    "X-Role": "ROLE_ADMIN",
    "X-Username": "admin",
    "Content-Type": "application/json"
}

def execute_job(job_id: str) -> None:
    """Thực thi một AI job và ghi log kết quả."""
    start_time = time.time()
    with SessionLocal() as db:
        job = db.query(AiJob).filter(AiJob.id == job_id).first()
        if not job:
            logger.error("Job %s not found", job_id)
            return

        # Kiểm tra setting tổng cho loại job
        if not _is_job_type_enabled(db, job.job_type):
            logger.info("Job type %s is disabled via settings, skipping", job.job_type)
            return

        log_entry = AiJobLog(
            id=str(uuid.uuid4()),
            job_id=job_id,
            status="RUNNING",
        )

        try:
            result = _dispatch(job)
            duration = time.time() - start_time
            result_json = json.dumps(result, ensure_ascii=False, default=str)

            log_entry.status = "SUCCESS"
            log_entry.result_json = result_json
            log_entry.duration_seconds = round(duration, 2)

            job.last_run_at = datetime.now(timezone.utc)
            job.run_count = (job.run_count or 0) + 1
            job.last_result_json = result_json
            job.last_error = None

        except Exception as exc:
            duration = time.time() - start_time
            error_msg = f"{type(exc).__name__}: {exc}"
            logger.exception("Job %s failed: %s", job_id, error_msg)

            log_entry.status = "FAILED"
            log_entry.error_message = error_msg[:2000]
            log_entry.duration_seconds = round(duration, 2)

            job.last_run_at = datetime.now(timezone.utc)
            job.error_count = (job.error_count or 0) + 1
            job.last_error = error_msg[:2000]

        db.add(log_entry)
        db.commit()


def _is_job_type_enabled(db, job_type: str) -> bool:
    """Kiểm tra xem loại job có được bật trong AI settings không."""
    mapping = {
        "PRICE_UPDATE": "PRICE_UPDATE_ENABLED",
        "ARTICLE_GEN": "AI_ARTICLE_GEN_ENABLED",
        "ARTICLE_UPDATE": "ARTICLE_AUTO_UPDATE_ENABLED",
        "COMMENT_REPLY": "AUTO_COMMENT_REPLY_ENABLED",
        "PRODUCT_ENRICH": "AI_PRODUCT_GEN_ENABLED",
    }
    setting_key = mapping.get(job_type)
    if not setting_key:
        return True  # Unknown type, allow
    setting = db.query(AiSetting).filter(AiSetting.key == setting_key).first()
    if not setting:
        return True  # Not configured, allow by default
    return setting.value.lower() == "true"


def _dispatch(job: AiJob) -> dict:
    """Phân loại và thực thi job theo type."""
    config = json.loads(job.config_json) if job.config_json else {}
    job_type = job.job_type

    if job_type == "PRICE_UPDATE":
        return _execute_price_update(config)
    elif job_type == "ARTICLE_GEN":
        return _execute_article_gen(config)
    elif job_type == "ARTICLE_UPDATE":
        return _execute_article_update(config)
    elif job_type == "COMMENT_REPLY":
        return _execute_comment_reply(config)
    elif job_type == "PRODUCT_ENRICH":
        return _execute_product_enrich(config)
    else:
        return {"message": f"Unknown job type: {job_type}"}


def _execute_price_update(config: dict) -> dict:
    """Tìm kiếm giá thị trường và cập nhật cho sản phẩm."""
    from app.services.catalog_research_service import CatalogResearchService

    research = CatalogResearchService()
    product_name = config.get("product_name", "")
    product_id = config.get("product_id")
    
    if not product_name or not product_id:
        return {"message": "Thiếu product_name hoặc product_id trong config", "updated": 0}

    sources, prices = research.search(f"{product_name} giá bán Việt Nam")
    if not prices:
        return {"message": f"Không tìm thấy giá cho {product_name}", "sources": len(sources), "prices": 0}

    avg_price = sum(p.price for p in prices) / len(prices)
    min_price = min(p.price for p in prices)
    max_price = max(p.price for p in prices)

    # Gọi API backend Java để cập nhật giá
    api_url = f"{API_PRODUCT_URL}/api/admin/products/{product_id}/price"
    payload = json.dumps({"price": int(avg_price)}).encode('utf-8')
    req = urllib.request.Request(api_url, data=payload, headers=ADMIN_HEADERS, method="PATCH")
    
    update_status = "Failed"
    try:
        with urllib.request.urlopen(req) as response:
            if response.status == 200:
                update_status = "Success"
    except Exception as e:
        logger.error(f"Failed to update price for product {product_id}: {e}")

    return {
        "message": f"Đã tìm thấy {len(prices)} nguồn giá cho {product_name}. Cập nhật giá trung bình: {int(avg_price)}",
        "avg_price": int(avg_price),
        "min_price": min_price,
        "max_price": max_price,
        "sources": len(sources),
        "update_status": update_status,
        "price_details": [
            {"seller": p.seller, "price": p.price, "url": p.source_url}
            for p in prices[:5]
        ],
    }


def _execute_article_gen(config: dict) -> dict:
    """Tự động tạo bài viết mới."""
    from app.services.article_service import ArticleService

    service = ArticleService()
    topic = config.get("topic", "Xu hướng công nghệ mới nhất")
    keywords = config.get("keywords", [])
    tone = config.get("tone", "Chuyên nghiệp, công nghệ")
    category = config.get("category", "Tin tức")

    result = service.generate(topic=topic, keywords=keywords, tone=tone, category=category)
    
    # Đẩy lên Article Service
    api_url = f"{API_ARTICLE_URL}/api/admin/articles"
    payload = json.dumps({
        "title": result.title,
        "summary": result.summary,
        "content": result.content,
        "category": result.category,
        "tags": result.tags,
        "status": "DRAFT",
        "cover_image_url": "",
        "author": "NovaGear AI"
    }).encode('utf-8')
    req = urllib.request.Request(api_url, data=payload, headers=ADMIN_HEADERS, method="POST")
    
    publish_status = "Failed"
    try:
        with urllib.request.urlopen(req) as response:
            if response.status in [200, 201]:
                publish_status = "Success"
    except Exception as e:
        logger.error(f"Failed to push article: {e}")

    return {
        "message": f"Đã tạo bài viết: {result.title}",
        "title": result.title,
        "summary": result.summary,
        "category": result.category,
        "tags": result.tags,
        "content_length": len(result.content),
        "publish_status": publish_status
    }


def _execute_article_update(config: dict) -> dict:
    """Cập nhật bài viết cũ với thông tin mới."""
    return {
        "message": "Article update — chức năng sẽ được kích hoạt khi có Article Service API",
        "updated": 0,
    }


def _execute_comment_reply(config: dict) -> dict:
    """Tự động trả lời comment chưa được trả lời."""
    from app.services.comment_service import CommentReplyService

    service = CommentReplyService()
    tone = config.get("tone", "thân thiện")
    
    # 1. Lấy danh sách comment chưa trả lời
    api_url = f"{API_PRODUCT_URL}/api/admin/products/reviews/unreplied?limit=5"
    req = urllib.request.Request(api_url, headers=ADMIN_HEADERS, method="GET")
    
    replied_count = 0
    errors = 0
    
    try:
        with urllib.request.urlopen(req) as response:
            data = json.loads(response.read().decode('utf-8'))
            unreplied_reviews = data.get("data", [])
            
            # 2. Xử lý từng comment
            for review in unreplied_reviews:
                comment_text = review.get("comment", "")
                if not comment_text:
                    continue
                    
                # Gọi AI tạo reply
                reply_text = service.generate_reply(comment_text, tone=tone)
                
                # 3. Gửi reply lại backend
                reply_api_url = f"{API_PRODUCT_URL}/api/admin/products/reviews/{review['id']}/reply"
                reply_payload = json.dumps({"reply": reply_text}).encode('utf-8')
                reply_req = urllib.request.Request(reply_api_url, data=reply_payload, headers=ADMIN_HEADERS, method="POST")
                
                try:
                    with urllib.request.urlopen(reply_req) as reply_res:
                        if reply_res.status == 200:
                            replied_count += 1
                except Exception as e:
                    logger.error(f"Failed to send reply for review {review['id']}: {e}")
                    errors += 1
                    
    except Exception as e:
        logger.error(f"Failed to fetch unreplied reviews: {e}")
        return {"message": f"Lỗi khi lấy danh sách comment: {e}", "tone": tone}

    return {
        "message": f"Đã quét và trả lời {replied_count} comments",
        "replied_count": replied_count,
        "errors": errors,
        "tone": tone,
    }


def _execute_product_enrich(config: dict) -> dict:
    """Bổ sung thông tin sản phẩm."""
    from app.services.catalog_research_service import CatalogResearchService

    research = CatalogResearchService()
    product_name = config.get("product_name", "")
    if not product_name:
        return {"message": "Thiếu product_name trong config", "enriched": 0}

    sources, _ = research.search(f"{product_name} thông số kỹ thuật đánh giá")
    return {
        "message": f"Đã tìm {len(sources)} nguồn thông tin cho {product_name}",
        "sources": [{"title": s.title, "url": s.url, "excerpt": s.excerpt[:200]} for s in sources[:5]],
    }
