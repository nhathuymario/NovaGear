from __future__ import annotations

import html
import re
from dataclasses import dataclass
from urllib import parse, request

from app.schemas.catalog import CatalogSourceEvidence, PriceObservation


@dataclass(frozen=True)
class SearchResult:
    title: str
    url: str
    snippet: str


_RESULT_PATTERN = re.compile(
    r'<a[^>]*class="result__a"[^>]*href="(?P<href>[^"]+)"[^>]*>(?P<title>.*?)</a>.*?'
    r'(?:<a[^>]*class="result__snippet"[^>]*>(?P<snippet>.*?)</a>|'
    r'<div[^>]*class="result__snippet"[^>]*>(?P<snippet2>.*?)</div>)',
    re.IGNORECASE | re.DOTALL,
)

_OFFICIAL_DOMAINS = (
    "apple.com",
    "samsung.com",
    "asus.com",
    "acer.com",
    "dell.com",
    "hp.com",
    "lenovo.com",
    "microsoft.com",
    "msi.com",
    "sony.com",
)

_PRICE_PATTERN = re.compile(
    r"(?<!\d)(?P<value>\d{1,3}(?:[.,\s]\d{3}){1,3}|\d{6,9})\s*(?:₫|đ|vnd)",
    re.IGNORECASE,
)


class CatalogResearchService:
    def search(
        self,
        query: str,
        *,
        limit: int = 5,
        timeout_seconds: float = 8.0,
    ) -> tuple[list[CatalogSourceEvidence], list[PriceObservation]]:
        results = self._search_duckduckgo(query, limit=limit, timeout_seconds=timeout_seconds)
        sources: list[CatalogSourceEvidence] = []
        prices: list[PriceObservation] = []

        for result in results:
            publisher = parse.urlparse(result.url).netloc.removeprefix("www.")
            official = any(publisher == domain or publisher.endswith(f".{domain}") for domain in _OFFICIAL_DOMAINS)
            trust_score = 0.9 if official else 0.55
            source_type = "manufacturer" if official else "retailer"

            sources.append(
                CatalogSourceEvidence(
                    title=result.title,
                    url=result.url,
                    publisher=publisher,
                    source_type=source_type,
                    excerpt=result.snippet[:1000],
                    trust_score=trust_score,
                )
            )

            price = extract_vnd_price(f"{result.title} {result.snippet}")
            if price is not None:
                prices.append(
                    PriceObservation(
                        seller=publisher,
                        source_url=result.url,
                        price=price,
                        currency="VND",
                        condition="NEW",
                        availability="UNKNOWN",
                        match_confidence=0.65 if official else 0.5,
                    )
                )

        return sources, prices

    def _search_duckduckgo(self, query: str, *, limit: int, timeout_seconds: float) -> list[SearchResult]:
        safe_query = query.strip()
        if not safe_query:
            return []

        search_url = f"https://html.duckduckgo.com/html/?q={parse.quote_plus(safe_query)}"
        http_request = request.Request(
            search_url,
            headers={"User-Agent": "Mozilla/5.0 (compatible; NovaGearCatalogBot/0.1)"},
            method="GET",
        )

        try:
            with request.urlopen(http_request, timeout=timeout_seconds) as response:
                body = response.read().decode("utf-8", errors="ignore")
        except Exception:
            return []

        results: list[SearchResult] = []
        for match in _RESULT_PATTERN.finditer(body):
            if len(results) >= limit:
                break

            raw_url = html.unescape(match.group("href") or "").strip()
            url = _unwrap_duckduckgo_url(raw_url)
            title = _clean_html(match.group("title") or "")
            snippet = _clean_html(match.group("snippet") or match.group("snippet2") or "")
            if not title or not url.startswith(("http://", "https://")):
                continue
            results.append(SearchResult(title=title, url=url, snippet=snippet or title))

        return results


def extract_vnd_price(value: str) -> int | None:
    match = _PRICE_PATTERN.search(value)
    if not match:
        return None

    digits = re.sub(r"\D", "", match.group("value"))
    if not digits:
        return None
    price = int(digits)
    return price if 10_000 <= price <= 2_000_000_000 else None


def _unwrap_duckduckgo_url(value: str) -> str:
    parsed = parse.urlparse(value)
    if parsed.netloc.endswith("duckduckgo.com"):
        redirect_target = parse.parse_qs(parsed.query).get("uddg", [])
        if redirect_target:
            return parse.unquote(redirect_target[0])
    return value


def _clean_html(value: str) -> str:
    text = html.unescape(value)
    text = re.sub(r"<[^>]+>", " ", text)
    return re.sub(r"\s+", " ", text).strip()
