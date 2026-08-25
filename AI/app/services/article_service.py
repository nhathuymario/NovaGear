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
        cover_image_url: str = None,
    ):
        self.title = title
        self.summary = summary
        self.content = content
        self.tags = tags
        self.category = category
        self.images = images or []
        self.cover_image_url = cover_image_url


class ArticleService:
    def generate(
        self,
        topic: str,
        keywords: list[str] | None = None,
        tone: ArticleTone = ArticleTone.PROFESSIONAL,
        category: str = "Công nghệ",
        auto_image: bool = True,
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
                f"Bạn là chuyên gia công nghệ hàng đầu và biên tập viên xuất sắc tại NovaGear.\n"
                f"Hãy viết một bài blog công nghệ cực kỳ chi tiết, sâu sắc và cuốn hút về chủ đề: \"{topic}\"\n"
                f"Từ khóa liên quan: {keywords_str}\n"
                f"Danh mục: {category}\n"
                f"Phong cách viết: {tone_desc}\n\n"
                f"Yêu cầu nội dung (RẤT QUAN TRỌNG):\n"
                f"- Độ dài bài viết phải cực kỳ chi tiết, phân tích sâu sắc.\n"
                f"- Cấu trúc mạch lạc, sử dụng rất nhiều thẻ heading (##, ###) để phân chia bố cục.\n"
                f"- Định dạng bằng Markdown, dùng in đậm, in nghiêng.\n\n"
            )

            if auto_image:
                prompt += f"- Sinh ra URL ảnh bìa bằng cách sử dụng định dạng: 'https://image.pollinations.ai/prompt/<từ-khóa-tiếng-anh-ngắn-gọn-mô-tả-chủ-đề>?width=1200&height=600&nologo=true'. Ví dụ: 'https://image.pollinations.ai/prompt/iphone%2016%20pro?width=1200&height=600&nologo=true'.\n\n"
            else:
                prompt += f"- Để trống trường cover_image_url.\n\n"

            prompt += (
                f"BẠN PHẢI TRẢ VỀ KẾT QUẢ THEO ĐỊNH DẠNG FRONTMATTER SAU:\n"
                f"```\n"
                f"---\n"
                f"title: [Tiêu đề bài viết]\n"
                f"summary: [Tóm tắt bài viết ngắn gọn]\n"
                f"tags: [tag1, tag2]\n"
                f"category: [Tên danh mục]\n"
                f"cover_image_url: [URL ảnh bìa hoặc để trống]\n"
                f"---\n"
                f"[Nội dung bài viết chi tiết bằng Markdown ở đây...]\n"
                f"```\n"
                f"KHÔNG thêm văn bản nào khác ngoài định dạng trên!"
            )

            response = client.models.generate_content(
                model=settings.gemini_model,
                contents=[prompt],
                config=types.GenerateContentConfig(
                    temperature=0.7,
                ),
            )

            text = response.text.strip() if response.text else ""
            
            # Remove markdown blocks if present
            import re
            match = re.search(r'^```(?:markdown)?\s*([\s\S]*?)\s*```$', text, re.IGNORECASE)
            if match:
                text = match.group(1).strip()
            
            # Parse frontmatter
            title = topic
            summary = ""
            content = text
            tags_list = keywords or []
            cat = category
            cover_url = ""

            fm_match = re.match(r'^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)', text)
            if fm_match:
                fm_text = fm_match.group(1)
                content = fm_match.group(2).strip()
                
                import yaml
                try:
                    metadata = yaml.safe_load(fm_text)
                    if isinstance(metadata, dict):
                        title = metadata.get("title", title)
                        summary = metadata.get("summary", summary)
                        cat = metadata.get("category", cat)
                        cover_url = metadata.get("cover_image_url", "")
                        
                        tags_val = metadata.get("tags", [])
                        if isinstance(tags_val, list):
                            tags_list = tags_val
                        elif isinstance(tags_val, str):
                            tags_list = [t.strip() for t in tags_val.split(",") if t.strip()]
                except Exception as yaml_exc:
                    logger.warning(f"Failed to parse YAML frontmatter: {yaml_exc}")

            return ArticleGeneratedContent(
                title=title,
                summary=summary,
                content=content,
                tags=tags_list,
                category=cat,
                cover_image_url=cover_url,
                images=[],
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
