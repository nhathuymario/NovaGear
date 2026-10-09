"""AI Comment Reply Service — Tự động tạo câu trả lời cho comment."""
from __future__ import annotations

import logging
from app.core.config import get_settings

logger = logging.getLogger(__name__)

TONE_DESCRIPTIONS = {
    "thân thiện": "thân thiện, gần gũi, dùng emoji nhẹ nhàng, xưng hô mình-bạn",
    "chuyên nghiệp": "lịch sự, chuyên nghiệp, xưng hô chúng tôi-quý khách",
    "hài hước": "vui vẻ, hài hước nhẹ nhàng nhưng vẫn chuyên nghiệp",
}


class CommentReplyService:
    """Service tạo câu trả lời tự động cho comment sản phẩm/bài viết."""

    def generate_reply(
        self,
        comment_text: str,
        *,
        tone: str = "thân thiện",
        product_name: str | None = None,
        context: str | None = None,
    ) -> str:
        """Tạo câu trả lời cho một comment."""
        settings = get_settings()
        if not settings.gemini_api_key:
            return self._fallback_reply(comment_text, tone)

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=settings.gemini_api_key)
            tone_desc = TONE_DESCRIPTIONS.get(tone, TONE_DESCRIPTIONS["thân thiện"])

            prompt = (
                f"Bạn là nhân viên chăm sóc khách hàng của NovaGear — cửa hàng công nghệ uy tín.\n"
                f"Phong cách trả lời: {tone_desc}\n\n"
            )

            if product_name:
                prompt += f"Sản phẩm liên quan: {product_name}\n"
            if context:
                prompt += f"Ngữ cảnh thêm: {context}\n"

            prompt += (
                f"\nComment của khách hàng:\n\"{comment_text}\"\n\n"
                f"Hãy viết một câu trả lời ngắn gọn (1-3 câu), phù hợp ngữ điệu.\n"
                f"CHỈ TRẢ VỀ NỘI DUNG CÂU TRẢ LỜI, không thêm bất kỳ gì khác."
            )

            response = client.models.generate_content(
                model=settings.gemini_model,
                contents=[prompt],
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=300,
                ),
            )

            reply = (response.text or "").strip()
            return reply if reply else self._fallback_reply(comment_text, tone)

        except Exception as exc:
            logger.exception("Comment reply generation failed: %s", exc)
            return self._fallback_reply(comment_text, tone)

    @staticmethod
    def _fallback_reply(comment_text: str, tone: str) -> str:
        """Câu trả lời mặc định khi AI không khả dụng."""
        if tone == "chuyên nghiệp":
            return (
                "Cảm ơn quý khách đã quan tâm đến sản phẩm của NovaGear. "
                "Chúng tôi sẽ phản hồi chi tiết trong thời gian sớm nhất."
            )
        if tone == "hài hước":
            return (
                "Cảm ơn bạn nhé! 😄 Team NovaGear sẽ check và phản hồi bạn sớm thôi!"
            )
        return (
            "Cảm ơn bạn đã chia sẻ! Mình sẽ kiểm tra và phản hồi bạn sớm nhất có thể nhé 😊"
        )
