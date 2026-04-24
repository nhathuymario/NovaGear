from __future__ import annotations

import html
import json
import re
import unicodedata
from dataclasses import dataclass
from urllib import error, parse, request
from typing import Sequence

from app.core.config import get_settings
from app.schemas.ai import RagQueryResponse, RagSource


@dataclass(frozen=True)
class KnowledgeDocument:
    title: str
    content: str
    keywords: tuple[str, ...]


@dataclass(frozen=True)
class WebResult:
    title: str
    url: str
    snippet: str


_KNOWLEDGE_BASE: tuple[KnowledgeDocument, ...] = (
    KnowledgeDocument(
        title="NovaGear Overview",
        content="NovaGear is built as a microservices platform with a React frontend, Spring Boot services, and an AI service for RAG and semantic search.",
        keywords=("novagear", "architecture", "microservices", "react", "spring", "ai"),
    ),
    KnowledgeDocument(
        title="Product Discovery",
        content="The AI service can enrich product discovery with semantic search, smart suggestions, and question answering over product or policy documents.",
        keywords=("product", "search", "suggestion", "semantic", "discover"),
    ),
    KnowledgeDocument(
        title="Support Knowledge Base",
        content="RAG should ingest FAQs, warranty policy, shipping policy, and product manuals so customer questions can be answered consistently.",
        keywords=("faq", "policy", "manual", "warranty", "shipping", "support"),
    ),
)

_POLICY_BASE: tuple[KnowledgeDocument, ...] = (
    KnowledgeDocument(
        title="Chính sách bảo hành",
        content=(
            "1. Sản phẩm được bảo hành theo chính sách của cửa hàng và hãng sản xuất. "
            "2. Thời gian tiếp nhận bảo hành: 8:00 - 22:00 mỗi ngày. "
            "3. Khách hàng cần cung cấp hóa đơn hoặc thông tin đơn hàng. "
            "4. Các lỗi do va đập, vào nước, can thiệp phần cứng không thuộc phạm vi bảo hành."
        ),
        keywords=("bao", "hanh", "bao-hanh", "warranty", "chinh", "sach"),
    ),
    KnowledgeDocument(
        title="Chính sách giao hàng",
        content=(
            "1. Đơn hàng được xác nhận trước 16:00 sẽ được xử lý trong ngày. "
            "2. Nội thành dự kiến 2-24 giờ, ngoại thành 2-5 ngày làm việc. "
            "3. Miễn phí vận chuyển cho đơn hàng từ 500.000đ (tùy khu vực). "
            "4. Đơn hàng giá trị cao có thể cần xác minh trước khi giao."
        ),
        keywords=("giao", "hang", "giao-hang", "shipping", "van", "chuyen"),
    ),
    KnowledgeDocument(
        title="Hướng dẫn thanh toán",
        content=(
            "1. Hỗ trợ COD cho khu vực đủ điều kiện. "
            "2. Hỗ trợ thanh toán online qua cổng thanh toán được tích hợp. "
            "3. Đơn hàng online cần thanh toán thành công để xác nhận. "
            "4. Vui lòng không chia sẻ OTP và thông tin tài khoản thanh toán."
        ),
        keywords=("thanh", "toan", "payment", "cod", "otp"),
    ),
    KnowledgeDocument(
        title="Liên hệ hỗ trợ 24/7",
        content=(
            "1. Hotline: 0123 456 789. "
            "2. Email: support@novagear.vn. "
            "3. Khung giờ hỗ trợ: 8:00 - 22:00 (Mon - Sun). "
            "4. Vui lòng cung cấp mã đơn hàng để được hỗ trợ nhanh hơn."
        ),
        keywords=("ho", "tro", "hotline", "support", "email"),
    ),
)

_DUCKDUCKGO_RESULT_PATTERN = re.compile(
    r'<a[^>]*class="result__a"[^>]*href="(?P<href>[^"]+)"[^>]*>(?P<title>.*?)</a>.*?'
    r'(?:<a[^>]*class="result__snippet"[^>]*>(?P<snippet>.*?)</a>|<div[^>]*class="result__snippet"[^>]*>(?P<snippet2>.*?)</div>)',
    re.IGNORECASE | re.DOTALL,
)


class RAGService:
    def answer(self, question: str, context: Sequence[str] | None = None, top_k: int = 5) -> RagQueryResponse:
        settings = get_settings()
        safe_top_k = max(1, min(top_k, 10))
        conversation_context = list(context or [])
        # Rank retrieval sources from the real user question to avoid noisy
        # always-on context making every reply look the same.
        query_tokens = _tokenize(question)
        product_hits = _extract_products_from_context(conversation_context)

        if _is_price_question(query_tokens) and product_hits:
            ranked_products = _rank_products_for_price_question(product_hits, question)
            answer, shop_source = _build_shop_price_response(question, ranked_products)
            return RagQueryResponse(
                question=question,
                answer=answer,
                confidence=0.94,
                mode="shop-price",
                sources=[shop_source],
            )

        static_sources = self._select_sources(query_tokens, safe_top_k)
        web_sources = self._collect_web_sources(question, query_tokens, settings)
        selected_sources = self._merge_sources(static_sources, web_sources, safe_top_k)

        if not settings.gemini_api_key:
            return RagQueryResponse(
                question=question,
                answer=self._build_non_gemini_answer(question, conversation_context, selected_sources),
                confidence=self._confidence_from_sources(selected_sources, gemini=False),
                mode="mock-rag",
                sources=selected_sources,
            )

        try:
            answer = self._generate_with_gemini(question, conversation_context, selected_sources, settings)
            mode = "gemini"
            confidence = self._confidence_from_sources(selected_sources, gemini=True)
        except Exception:
            answer = self._build_non_gemini_answer(question, conversation_context, selected_sources)
            mode = "fallback"
            confidence = self._confidence_from_sources(selected_sources, gemini=False)

        return RagQueryResponse(
            question=question,
            answer=answer,
            confidence=confidence,
            mode=mode,
            sources=selected_sources,
        )

    def _select_sources(self, query_tokens: set[str], top_k: int) -> list[RagSource]:
        scored_sources: list[RagSource] = []
        for document in (*_KNOWLEDGE_BASE, *_POLICY_BASE):
            score = _score_document(query_tokens, document)
            if score <= 0:
                continue
            scored_sources.append(
                RagSource(
                    title=document.title,
                    excerpt=document.content[:240],
                    score=round(score, 2),
                )
            )

        scored_sources.sort(key=lambda item: item.score, reverse=True)
        return scored_sources[:top_k]

    def _collect_web_sources(self, question: str, query_tokens: set[str], settings) -> list[RagSource]:
        if not settings.enable_web_search:
            return []

        if _is_greeting(question, query_tokens):
            return []

        if len(query_tokens) < 2:
            return []

        web_results = self._search_duckduckgo(question, settings.web_search_max_results, settings.web_search_timeout_seconds)
        return [
            RagSource(
                title=f"Web: {result.title}",
                excerpt=result.snippet[:240],
                score=0.45,
            )
            for result in web_results
        ]

    def _search_duckduckgo(self, query: str, limit: int, timeout_seconds: float) -> list[WebResult]:
        safe_query = query.strip()
        if not safe_query:
            return []

        search_url = f"https://html.duckduckgo.com/html/?q={parse.quote_plus(safe_query)}"
        http_request = request.Request(
            search_url,
            headers={"User-Agent": "Mozilla/5.0 (NovaGear AI)"},
            method="GET",
        )

        try:
            with request.urlopen(http_request, timeout=timeout_seconds) as response:
                body = response.read().decode("utf-8", errors="ignore")
        except Exception:
            return []

        results: list[WebResult] = []
        for match in _DUCKDUCKGO_RESULT_PATTERN.finditer(body):
            if len(results) >= limit:
                break

            href = html.unescape(match.group("href") or "").strip()
            title = _clean_html_text(match.group("title") or "")
            snippet = _clean_html_text(match.group("snippet") or match.group("snippet2") or "")

            if not title or not href:
                continue

            results.append(WebResult(title=title, url=href, snippet=snippet or title))

        return results

    def _merge_sources(
        self,
        static_sources: Sequence[RagSource],
        web_sources: Sequence[RagSource],
        top_k: int,
    ) -> list[RagSource]:
        merged: list[RagSource] = []
        seen_titles: set[str] = set()

        for source in list(static_sources) + list(web_sources):
            normalized_title = source.title.strip().lower()
            if not normalized_title or normalized_title in seen_titles:
                continue
            seen_titles.add(normalized_title)
            merged.append(source)

        return merged[:top_k]

    def _build_mock_answer(self, selected_sources: Sequence[RagSource]) -> str:
        if selected_sources:
            return (
                "Dựa trên tài liệu nội bộ, câu hỏi của bạn liên quan đến: "
                + "; ".join(source.title for source in selected_sources)
                + ". Hãy xem phần trích dẫn để đối chiếu chi tiết."
            )

        return (
            "Chưa tìm thấy tài liệu đủ liên quan. Hãy cung cấp thêm ngữ cảnh hoặc ingest thêm source vào vector store."
        )

    def _build_non_gemini_answer(
        self,
        question: str,
        context: Sequence[str],
        selected_sources: Sequence[RagSource],
    ) -> str:
        query_tokens = _tokenize(question)

        if _is_greeting(question, query_tokens):
            return (
                "Chào bạn! Mình là trợ lý NovaGear. Bạn có thể hỏi mình về giá sản phẩm, bảo hành, giao hàng, "
                "thanh toán hoặc gợi ý mẫu phù hợp theo ngân sách."
            )

        if _is_price_question(query_tokens):
            product_hits = _extract_products_from_context(context)
            if product_hits:
                ranked_products = _rank_products_for_price_question(product_hits, question)
                top_products = ranked_products[:3]
                product_lines = [f"- {item['name']}: {item['price_text']}" for item in top_products]
                return (
                    "Mình tìm nhanh theo dữ liệu sản phẩm trên shop, bạn tham khảo nhé:\n"
                    + "\n".join(product_lines)
                    + "\nBạn muốn mình lọc thêm theo tầm giá cụ thể hoặc nhu cầu (học tập, gaming, văn phòng) không?"
                )

        if not selected_sources:
            return (
                "Mình chưa thấy nguồn dữ liệu phù hợp để trả lời chính xác câu này. "
                "Bạn có thể nói rõ hơn nhu cầu (sản phẩm nào, tầm giá, khu vực giao hàng...) để mình hỗ trợ tốt hơn."
            )

        top_source = selected_sources[0]
        related_titles = "; ".join(source.title for source in selected_sources[:3])

        if top_source.title.lower().startswith("web:"):
            return (
                f"Mình tham khảo nhanh từ web cho câu hỏi '{question}': "
                f"{top_source.excerpt}. "
                f"Bạn có thể đối chiếu thêm ở các nguồn: {related_titles}."
            )

        return (
            f"Với câu hỏi '{question}', thông tin phù hợp nhất hiện tại là: "
            f"{top_source.excerpt}. "
            f"Mình đang tham chiếu thêm từ: {related_titles}."
        )

    def _confidence_from_sources(self, selected_sources: Sequence[RagSource], *, gemini: bool) -> float:
        if not selected_sources:
            return 0.35 if gemini else 0.15

        average_score = sum(source.score for source in selected_sources) / len(selected_sources)
        if gemini:
            return min(1.0, round(0.55 + average_score * 0.45, 2))

        return min(1.0, round(average_score, 2))

    def _generate_with_gemini(
        self,
        question: str,
        context: Sequence[str],
        selected_sources: Sequence[RagSource],
        settings,
    ) -> str:
        prompt = self._build_prompt(question, context, selected_sources)
        payload = {
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": prompt}],
                }
            ],
            "generationConfig": {
                "temperature": 0.2,
                "topP": 0.95,
                "maxOutputTokens": 512,
            },
        }

        url = f"{settings.gemini_base_url.rstrip('/')}/models/{settings.gemini_model}:generateContent"
        query_string = parse.urlencode({"key": settings.gemini_api_key})
        body = json.dumps(payload).encode("utf-8")
        http_request = request.Request(
            f"{url}?{query_string}",
            data=body,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with request.urlopen(http_request, timeout=settings.gemini_timeout_seconds) as response:
                response_payload = json.loads(response.read().decode("utf-8"))
        except error.HTTPError as exc:
            raw_error = exc.read().decode("utf-8", errors="ignore") if exc.fp else ""
            response_payload = _safe_json_load(raw_error) or {"error": {"message": str(exc)}}

        return self._extract_gemini_text(response_payload)

    def _build_prompt(
        self,
        question: str,
        context: Sequence[str],
        selected_sources: Sequence[RagSource],
    ) -> str:
        source_lines = [
            f"- {index}. {source.title}: {source.excerpt} (score={source.score})"
            for index, source in enumerate(selected_sources, start=1)
        ]
        context_text = "\n".join(f"- {item}" for item in context) if context else "- Không có ngữ cảnh bổ sung"
        sources_text = "\n".join(source_lines) if source_lines else "- Không có nguồn nào khớp"

        return (
            "Bạn là trợ lý AI của NovaGear. Hãy trả lời bằng tiếng Việt, ngắn gọn, rõ ràng và thực tế. "
            "Ưu tiên sử dụng các nguồn tham chiếu bên dưới. Nếu thông tin chưa đủ, hãy nói rõ là chưa đủ dữ liệu thay vì bịa.\n\n"
            f"Câu hỏi: {question}\n\n"
            f"Ngữ cảnh bổ sung:\n{context_text}\n\n"
            f"Nguồn tham chiếu:\n{sources_text}\n\n"
            "Hãy trả lời ngay dưới đây:"
        )

    def _extract_gemini_text(self, payload: dict) -> str:
        candidates = payload.get("candidates") or []
        for candidate in candidates:
            content = candidate.get("content") or {}
            parts = content.get("parts") or []
            texts = [str(part.get("text", "")).strip() for part in parts if str(part.get("text", "")).strip()]
            if texts:
                return "\n".join(texts).strip()

        error_message = payload.get("error", {}).get("message")
        if error_message:
            raise RuntimeError(error_message)

        raise RuntimeError("Gemini response did not contain any text content")


def _tokenize(value: str) -> set[str]:
    tokens = set()
    normalized_value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    for token in normalized_value.lower().replace("/", " ").replace("-", " ").replace(",", " ").split():
        cleaned = "".join(char for char in token if char.isalnum())
        if cleaned:
            tokens.add(cleaned)
    return tokens


def _clean_html_text(value: str) -> str:
    text = html.unescape(value)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _is_greeting(question: str, query_tokens: set[str]) -> bool:
    normalized = question.strip().lower()
    greeting_markers = {"hello", "hi", "helo", "xin", "chao", "alo"}

    if normalized in {"hello", "hi", "alo", "xin chao", "chao"}:
        return True

    if len(query_tokens) <= 2 and query_tokens & greeting_markers:
        return True

    return False


def _is_price_question(query_tokens: set[str]) -> bool:
    if {"bao", "hanh"}.issubset(query_tokens):
        return False

    if {"phi", "ship"}.issubset(query_tokens) or {"giao", "hang"}.issubset(query_tokens):
        return False

    has_price_signal = "gia" in query_tokens or "price" in query_tokens
    has_amount_pattern = "bao" in query_tokens and "nhieu" in query_tokens
    has_product_hint = bool(query_tokens & {"iphone", "ip", "dien", "thoai", "laptop", "macbook", "samsung"})
    return (has_price_signal or has_amount_pattern) and has_product_hint


def _extract_products_from_context(context: Sequence[str]) -> list[dict[str, str | int]]:
    pattern = re.compile(
        r"San pham:\s*(?P<name>[^;]+);\s*Gia:\s*(?P<price>[^;]+);\s*Nganh:\s*(?P<category>[^;]+);\s*Mo ta:\s*(?P<desc>.*)",
        re.IGNORECASE,
    )
    products: list[dict[str, str | int]] = []

    for item in context:
        match = pattern.search(str(item))
        if not match:
            continue

        price_text = match.group("price").strip()
        price_digits = re.sub(r"[^0-9]", "", price_text)
        price_value = int(price_digits) if price_digits else 0

        products.append(
            {
                "name": match.group("name").strip(),
                "price_text": price_text,
                "category": match.group("category").strip(),
                "description": match.group("desc").strip(),
                "price_value": price_value,
            }
        )

    return products


def _rank_products_for_price_question(products: Sequence[dict[str, str | int]], question: str) -> list[dict[str, str | int]]:
    lowered_question = question.lower()
    wants_iphone = any(token in lowered_question for token in ("iphone", "ip ", " ip", "điện thoại", "dien thoai"))

    filtered = list(products)
    if wants_iphone:
        iphone_products = [item for item in filtered if "iphone" in str(item["name"]).lower() or "ip" in str(item["name"]).lower()]
        if iphone_products:
            filtered = iphone_products

    def score(item: dict[str, str | int]) -> tuple[int, int]:
        name = str(item["name"]).lower()
        category = str(item["category"]).lower()
        match_score = 0
        if "laptop" in lowered_question and "laptop" in (name + " " + category):
            match_score += 3
        if wants_iphone and ("iphone" in name or "ip" in name):
            match_score += 4
        price_value = int(item["price_value"])
        # Prefer products close to 20M for common budget questions.
        distance = abs(price_value - 20_000_000)
        return (-match_score, distance)

    return sorted(filtered, key=score)


def _build_shop_price_response(question: str, ranked_products: Sequence[dict[str, str | int]]) -> tuple[str, RagSource]:
    top_products = list(ranked_products[:3])

    if not top_products:
        answer = (
            f"Mình chưa tìm thấy sản phẩm phù hợp trong shop cho câu hỏi '{question}'. "
            "Bạn thử nói rõ thêm tên mẫu, phiên bản hoặc khoảng giá nhé."
        )
        return answer, RagSource(title="Dữ liệu sản phẩm trong shop", excerpt="Không tìm thấy sản phẩm phù hợp", score=1.0)

    product_lines = [f"- {item['name']}: {item['price_text']}" for item in top_products]
    answer = (
        "Mình xem nhanh giá trong shop cho bạn nhé:\n"
        + "\n".join(product_lines)
        + "\nNếu bạn muốn, mình có thể lọc tiếp theo bản thường / Pro / Pro Max, hoặc theo mức giá bạn đang muốn."
    )
    excerpt = "; ".join(product_lines[:3])
    return answer, RagSource(title="Dữ liệu sản phẩm trong shop", excerpt=excerpt, score=1.0)


def _score_document(query_tokens: set[str], document: KnowledgeDocument) -> float:
    if not query_tokens:
        return 0.0
    keyword_tokens = set(document.keywords)
    matched = len(query_tokens & keyword_tokens)
    if matched == 0:
        return 0.0
    return matched / max(len(keyword_tokens), len(query_tokens))


def _safe_json_load(value: str) -> dict | None:
    if not value.strip():
        return None

    try:
        loaded = json.loads(value)
    except json.JSONDecodeError:
        return None

    return loaded if isinstance(loaded, dict) else None

