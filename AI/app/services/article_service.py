from __future__ import annotations

import json
import logging
import re
import unicodedata

from app.core.config import get_settings
from app.schemas.article import ArticleTone

logger = logging.getLogger(__name__)


TONE_PROMPTS: dict[ArticleTone, str] = {
    ArticleTone.PROFESSIONAL: "chuyên nghiệp, chính xác, phù hợp cho blog công nghệ doanh nghiệp",
    ArticleTone.CASUAL: "thân thiện, dễ hiểu, như đang nói chuyện với bạn bè đam mê công nghệ",
    ArticleTone.REVIEW: "đánh giá chi tiết, so sánh ưu/nhược điểm, kết luận rõ ràng",
    ArticleTone.TUTORIAL: "hướng dẫn từng bước, có mục tiêu rõ ràng, kèm mẹo thực hành",
}


class ArticleGeneratedContent:
    def __init__(
        self,
        title: str,
        summary: str,
        content: str,
        tags: list[str],
        category: str,
        images: list[dict] = None,
    ):
        self.title = title
        self.summary = summary
        self.content = content
        self.tags = tags
        self.category = category
        self.images = images or []


class ArticleService:
    def generate(
        self,
        topic: str,
        keywords: list[str] | None = None,
        tone: ArticleTone = ArticleTone.PROFESSIONAL,
        category: str = "Công nghệ",
    ) -> ArticleGeneratedContent:
        settings = get_settings()
        if not settings.gemini_api_key:
            return self._fallback_generate(topic, keywords or [], tone, category)

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=settings.gemini_api_key)

            keywords_str = ", ".join(keywords) if keywords else "không có"
            tone_desc = TONE_PROMPTS.get(tone, TONE_PROMPTS[ArticleTone.PROFESSIONAL])

            prompt = (
                f"Bạn là chuyên gia viết bài công nghệ cho NovaGear — cửa hàng bán lẻ thiết bị công nghệ cao cấp.\n"
                f"Viết một bài viết blog về chủ đề: \"{topic}\"\n"
                f"Từ khóa liên quan: {keywords_str}\n"
                f"Danh mục: {category}\n"
                f"Phong cách viết: {tone_desc}\n\n"
                f"Yêu cầu:\n"
                f"- Tiêu đề hấp dẫn, SEO-friendly\n"
                f"- Tóm tắt ngắn gọn (2-3 câu)\n"
                f"- Nội dung đầy đủ, tối thiểu 800 từ, sử dụng Markdown formatting\n"
                f"- Chia thành các mục rõ ràng với heading (## và ###)\n"
                f"- Có phần mở đầu, nội dung chính và kết luận\n"
                f"- Sử dụng tiếng Việt tự nhiên, chuyên nghiệp\n"
                f"- Đề xuất 3-5 tags phù hợp\n"
                f"- Đề xuất 2-3 hình ảnh minh hoạ phù hợp. Sử dụng định dạng URL: 'https://loremflickr.com/800/600/<từ-khóa-tiếng-anh>'. Ví dụ từ khóa: laptop, smartphone, gaming, tech...\n\n"
                f"Trả về JSON với các trường:\n"
                f'{{"title": "...", "summary": "...", "content": "... (markdown)", "tags": ["tag1", "tag2"], "category": "...", "images": [{{"imageUrl": "...", "caption": "..."}}]}}'
            )

            response = client.models.generate_content(
                model=settings.gemini_model,
                contents=[prompt],
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    response_mime_type="application/json",
                ),
            )

            text = response.text.strip()
            data = json.loads(text)

            return ArticleGeneratedContent(
                title=data.get("title", topic),
                summary=data.get("summary", ""),
                content=data.get("content", ""),
                tags=data.get("tags", keywords or []),
                category=data.get("category", category),
                images=data.get("images", []),
            )
        except Exception as exc:
            logger.exception("Gemini article generation failed for topic: %s", topic)
            result = self._fallback_generate(topic, keywords or [], tone, category)
            result.content += f"\n\n> ⚠️ Gemini AI gặp lỗi: {type(exc).__name__}. Đây là bản nháp mẫu."
            return result

    @staticmethod
    def _fallback_generate(
        topic: str,
        keywords: list[str],
        tone: ArticleTone,
        category: str,
    ) -> ArticleGeneratedContent:
        keywords_str = ", ".join(keywords) if keywords else "công nghệ"
        return ArticleGeneratedContent(
            title=f"{topic} — Tin tức công nghệ mới nhất",
            summary=f"Bài viết tổng hợp về {topic}. Cập nhật thông tin, đánh giá và xu hướng mới nhất.",
            content=(
                f"## {topic}\n\n"
                f"Chào mừng bạn đến với bài viết về **{topic}** trên NovaGear Blog.\n\n"
                f"### Giới thiệu\n\n"
                f"Trong thế giới công nghệ không ngừng phát triển, {topic.lower()} "
                f"đang trở thành một chủ đề được quan tâm hàng đầu. "
                f"Bài viết này sẽ cung cấp cho bạn những thông tin mới nhất và chi tiết nhất.\n\n"
                f"### Nội dung chính\n\n"
                f"Các từ khóa liên quan: **{keywords_str}**\n\n"
                f"*(Nội dung chi tiết sẽ được AI sinh ra khi Gemini API được cấu hình)*\n\n"
                f"### Kết luận\n\n"
                f"Hãy theo dõi NovaGear để cập nhật những tin tức công nghệ mới nhất!\n"
            ),
            tags=keywords if keywords else [category, "công nghệ", "tin tức"],
            category=category,
            images=[
                {"imageUrl": f"https://loremflickr.com/800/600/tech", "caption": f"Hình ảnh minh hoạ cho {topic}"}
            ]
        )


def slugify_article(value: str) -> str:
    normalized = value.lower().replace("đ", "d")
    normalized = unicodedata.normalize("NFKD", normalized).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", normalized).strip("-")
    return slug or "bai-viet-cong-nghe"
