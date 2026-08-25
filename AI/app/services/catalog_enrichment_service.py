from __future__ import annotations

import re
import unicodedata
from pathlib import Path

from app.core.config import get_settings
from app.schemas.catalog import CatalogProductDraft, CatalogVariantDraft, VisionCatalogExtraction, CatalogSourceEvidence
from app.services.catalog_research_service import CatalogResearchService
from urllib import request as urllib_request, parse


class CatalogEnrichmentService:
    def __init__(self, research_service: CatalogResearchService | None = None):
        self.research_service = research_service or CatalogResearchService()

    def analyze(self, image_path: str, content_type: str, hint: str | None = None) -> CatalogProductDraft:
        settings = get_settings()
        extraction = self._analyze_image(image_path, content_type, hint)
        query_parts = [extraction.brand, extraction.name, extraction.model_number, "giá thông số"]
        query = " ".join(part.strip() for part in query_parts if part and part.strip())
        if settings.enable_web_search:
            sources, prices = self.research_service.search(
                query,
                limit=settings.catalog_web_result_limit,
                timeout_seconds=settings.web_search_timeout_seconds,
            )
        else:
            sources, prices = [], []

        if content_type == "text/uri-list":
            try:
                original_url = Path(image_path).read_text("utf-8").strip()
                if original_url and not any(s.url == original_url for s in sources):
                    sources.insert(0, CatalogSourceEvidence(
                        title="Nguồn từ URL đã nhập",
                        url=original_url,
                        publisher=parse.urlparse(original_url).netloc,
                        source_type="user_provided",
                        excerpt="URL do admin cung cấp",
                        trust_score=0.9,
                    ))
            except Exception:
                pass

        variants = extraction.variants
        if not variants and prices and extraction.model_number:
            sorted_prices = sorted(item.price for item in prices)
            variants = [
                CatalogVariantDraft(
                    sku=extraction.model_number,
                    version_name="Tiêu chuẩn",
                    price=sorted_prices[len(sorted_prices) // 2],
                    confidence=min(extraction.confidence, 0.55),
                )
            ]
        if variants and not variants[0].sku.strip() and extraction.model_number:
            variants[0].sku = extraction.model_number
        if variants and variants[0].price is None and prices:
            sorted_prices = sorted(item.price for item in prices)
            variants[0].price = sorted_prices[len(sorted_prices) // 2]

        warnings = list(extraction.warnings)
        if settings.enable_web_search and not sources:
            warnings.append("Chưa thu thập được nguồn web; admin cần xác minh tên, thông số và giá.")
        if not settings.gemini_api_key:
            warnings.append("Gemini chưa được cấu hình; kết quả hiện chỉ là bản nháp fallback từ tên file/gợi ý.")
        warnings.append("Giá tìm được là giá công khai tham khảo, không phải giá vốn nhập hàng.")

        return CatalogProductDraft(
            name=extraction.name,
            slug=slugify(extraction.name),
            brand=extraction.brand,
            model_number=extraction.model_number,
            gtin=extraction.gtin,
            category_hint=extraction.category_hint,
            short_description=extraction.short_description,
            description=extraction.description,
            confidence=extraction.confidence,
            variants=variants,
            specifications=extraction.specifications,
            sources=sources,
            price_observations=prices,
            warnings=_deduplicate(warnings),
        )

    def _analyze_image(self, image_path: str, content_type: str, hint: str | None) -> VisionCatalogExtraction:
        settings = get_settings()
        if not settings.gemini_api_key:
            return fallback_extraction(image_path, hint)

        try:
            from google import genai
            from google.genai import types

            client = genai.Client(api_key=settings.gemini_api_key)
            
            if content_type == "text/plain":
                prompt = (
                    "Bạn là chuyên viên catalog thiết bị công nghệ của NovaGear. "
                    f"Nhiệm vụ của bạn là tạo bản nháp sản phẩm chi tiết nhất có thể dựa trên yêu cầu sau: {hint}. "
                    "Tự động điền đầy đủ các thông số kỹ thuật, liệt kê các biến thể (variants) thường gặp của sản phẩm này. "
                    "Tuyệt đối không bịa đặt những thông tin sai lệch về bản chất sản phẩm."
                )
                contents = [prompt]
            elif content_type == "text/uri-list":
                url = Path(image_path).read_text("utf-8").strip()
                try:
                    web_text = fetch_url_text(url)
                except Exception as e:
                    web_text = f"[Không thể đọc URL: {e}]"
                
                prompt = (
                    "Bạn là chuyên viên catalog thiết bị công nghệ của NovaGear. "
                    f"Phân tích nội dung trang web sau để tạo bản nháp sản phẩm: {url}\n\n"
                    f"Nội dung trang (có chứa các ảnh dưới dạng [Ảnh: alt - src]):\n{web_text}\n\n"
                    f"Gợi ý từ admin: {hint or 'không có'}. "
                    "Tự động điền đầy đủ các thông số kỹ thuật, liệt kê các biến thể (variants) thường gặp của sản phẩm này. "
                    "Tuyệt đối không bịa đặt những thông tin sai lệch về bản chất sản phẩm.\n\n"
                    "LƯU Ý QUAN TRỌNG KHI VIẾT DESCRIPTION:\n"
                    "- Bài viết phải chuẩn SEO, chia thành các đoạn <h2>, <h3> rõ ràng.\n"
                    "- BẮT BUỘC viết rất dài, ít nhất 1500 chữ, đi sâu vào thiết kế, hiệu năng, màn hình, camera, v.v.\n"
                    "- BẮT BUỘC chèn nhiều hình ảnh minh hoạ vào giữa các đoạn văn. Sử dụng các link ảnh được cung cấp trong nội dung trang (dạng [Ảnh: alt - src]) và viết thành mã HTML <img src=\"src\" alt=\"alt\">."
                )
                contents = [prompt]
            else:
                image_bytes = Path(image_path).read_bytes()
                prompt = (
                    "Bạn là chuyên viên catalog thiết bị công nghệ của NovaGear. "
                    "Phân tích ảnh để tạo bản nháp sản phẩm bằng tiếng Việt. Chỉ ghi thông tin có thể nhìn thấy "
                    "hoặc xác định với độ tin cậy cao; tuyệt đối không tự bịa RAM, dung lượng, giá hay SKU. "
                    "Nếu ảnh chưa đủ để xác định đúng biến thể, hãy để trường đó trống và thêm cảnh báo. "
                    f"Gợi ý từ admin: {hint or 'không có'}."
                )
                contents = [
                    prompt,
                    types.Part.from_bytes(data=image_bytes, mime_type=content_type),
                ]

            response = client.models.generate_content(
                model=settings.gemini_model,
                contents=contents,
                config=types.GenerateContentConfig(
                    temperature=0.3 if content_type == "text/plain" else 0.1,
                    response_mime_type="application/json",
                    response_schema=VisionCatalogExtraction,
                ),
            )
            if getattr(response, "parsed", None):
                return VisionCatalogExtraction.model_validate(response.parsed)
            return VisionCatalogExtraction.model_validate_json(response.text)
        except Exception as exc:
            fallback = fallback_extraction(image_path, hint)
            fallback.warnings.append(f"Gemini phân tích thất bại, đã dùng fallback: {type(exc).__name__}")
            return fallback


def fallback_extraction(image_path: str, hint: str | None) -> VisionCatalogExtraction:
    filename = Path(image_path).stem
    normalized_filename = re.sub(r"[_-]+", " ", filename).strip()
    generic_filename = not normalized_filename or bool(re.fullmatch(r"(?:img|image|photo)?\s*\d*", normalized_filename, re.I))
    name = (hint or "").strip() or ("Sản phẩm chưa xác định" if generic_filename else normalized_filename.title())
    return VisionCatalogExtraction(
        name=name,
        brand="Chưa xác định",
        category_hint="Khác",
        short_description="Bản nháp đang chờ admin xác minh từ ảnh sản phẩm.",
        description="",
        confidence=0.05,
        variants=[],
        specifications=[],
        warnings=["Không thể xác định chính xác sản phẩm nếu chỉ dựa vào tên file."],
    )


def fetch_url_text(url: str) -> str:
    req = urllib_request.Request(
        url,
        headers={"User-Agent": "Mozilla/5.0 (compatible; NovaGearCatalogBot/0.1)"},
        method="GET",
    )
    with urllib_request.urlopen(req, timeout=10.0) as response:
        html_content = response.read().decode("utf-8", errors="ignore")
    
    html_content = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", html_content, flags=re.IGNORECASE | re.DOTALL)
    
    def replace_img(match: re.Match[str]) -> str:
        img_tag = match.group(0)
        src_match = re.search(r'src=["\']([^"\']+)["\']', img_tag, re.IGNORECASE)
        alt_match = re.search(r'alt=["\']([^"\']+)["\']', img_tag, re.IGNORECASE)
        src = src_match.group(1) if src_match else ""
        alt = alt_match.group(1) if alt_match else ""
        if src.startswith("//"):
            src = "https:" + src
        elif src.startswith("/"):
            from urllib.parse import urljoin
            src = urljoin(url, src)
            
        if src and not src.startswith("data:"):
            return f"\n[Ảnh: {alt} - {src}]\n"
        return " "

    html_content = re.sub(r"<img[^>]+>", replace_img, html_content, flags=re.IGNORECASE)
    
    text = re.sub(r"<[^>]+>", " ", html_content)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:25000]


def slugify(value: str) -> str:
    normalized = value.lower().replace("đ", "d")
    normalized = unicodedata.normalize("NFKD", normalized).encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-z0-9]+", "-", normalized).strip("-")
    return slug or "san-pham-ai-draft"


def _deduplicate(values: list[str]) -> list[str]:
    return list(dict.fromkeys(value.strip() for value in values if value and value.strip()))
