from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from app.schemas.ai import SearchResponse, SearchResult


@dataclass(frozen=True)
class CatalogItem:
    title: str
    excerpt: str
    keywords: tuple[str, ...]
    category: str


_CATALOG: tuple[CatalogItem, ...] = (
    CatalogItem(
        title="NovaGear Pro Laptop",
        excerpt="High-performance laptop for creators, engineers, and AI workloads.",
        keywords=("laptop", "ai", "performance", "creator", "gaming"),
        category="laptop",
    ),
    CatalogItem(
        title="NovaGear 3D Headset",
        excerpt="Immersive headset suited for AR, VR, and product demo experiences.",
        keywords=("headset", "3d", "vr", "ar", "immersive"),
        category="accessory",
    ),
    CatalogItem(
        title="NovaGear Mechanical Keyboard",
        excerpt="Responsive keyboard with premium key switches and RGB profiles.",
        keywords=("keyboard", "mechanical", "rgb", "peripheral"),
        category="peripheral",
    ),
    CatalogItem(
        title="NovaGear Smart Monitor",
        excerpt="Large display optimized for dashboards, content browsing, and productivity.",
        keywords=("monitor", "display", "productivity", "dashboard"),
        category="monitor",
    ),
)

_SYNONYMS: dict[str, tuple[str, ...]] = {
    "tai nghe": ("headset", "vr", "ar"),
    "ban phim": ("keyboard", "mechanical"),
    "man hinh": ("monitor", "display"),
    "laptop": ("laptop", "notebook"),
}


class SearchService:
    def suggest(self, query: str, limit: int = 5, backend: str = "meilisearch") -> SearchResponse:
        query_tokens = _tokenize(query)
        scored = self._rank_items(query_tokens)

        results = [
            SearchResult(
                title=item.title,
                excerpt=item.excerpt,
                score=round(score, 2),
                reason=self._reason(query_tokens, item),
            )
            for item, score in scored[:limit]
        ]

        if not results:
            results = [
                SearchResult(
                    title=item.title,
                    excerpt=item.excerpt,
                    score=0.2,
                    reason="Fallback suggestion from the curated catalog",
                )
                for item in _CATALOG[:limit]
            ]

        return SearchResponse(query=query, backend=f"mock-{backend}", results=results)

    def semantic_search(self, query: str, limit: int = 5, backend: str = "meilisearch") -> SearchResponse:
        query_tokens = _tokenize(query)
        scored = self._rank_items(query_tokens, semantic=True)

        results = [
            SearchResult(
                title=item.title,
                excerpt=item.excerpt,
                score=round(score, 2),
                reason=self._reason(query_tokens, item, semantic=True),
            )
            for item, score in scored[:limit]
        ]

        if not results:
            results = self.suggest(query, limit, backend).results

        return SearchResponse(query=query, backend=f"mock-semantic-{backend}", results=results)

    def _rank_items(self, query_tokens: set[str], semantic: bool = False) -> list[tuple[CatalogItem, float]]:
        ranked: list[tuple[CatalogItem, float]] = []
        for item in _CATALOG:
            score = _score_item(query_tokens, item, semantic=semantic)
            if score > 0:
                ranked.append((item, score))
        ranked.sort(key=lambda entry: entry[1], reverse=True)
        return ranked

    def _reason(self, query_tokens: set[str], item: CatalogItem, semantic: bool = False) -> str:
        matched_keywords = sorted(query_tokens & set(item.keywords))
        if matched_keywords:
            return f"Matched keywords: {', '.join(matched_keywords)}"
        if semantic:
            return f"Semantic match for category: {item.category}"
        return "Prefix / partial catalog match"


def _tokenize(value: str) -> set[str]:
    normalized = value.lower()
    tokens = set()
    for piece in normalized.replace("/", " ").replace("-", " ").replace(",", " ").split():
        cleaned = "".join(char for char in piece if char.isalnum())
        if cleaned:
            tokens.add(cleaned)
    for phrase, related in _SYNONYMS.items():
        if phrase in normalized:
            tokens.update(related)
    return tokens


def _score_item(query_tokens: set[str], item: CatalogItem, semantic: bool = False) -> float:
    if not query_tokens:
        return 0.0

    keywords = set(item.keywords) | {item.category}
    if semantic:
        expanded_keywords = set(keywords)
        for keyword in keywords:
            for phrase, related in _SYNONYMS.items():
                if keyword in related:
                    expanded_keywords.add(phrase.replace(" ", ""))
        keywords = expanded_keywords

    matched = len(query_tokens & keywords)
    if matched == 0:
        title_tokens = _tokenize(item.title)
        matched = len(query_tokens & title_tokens)
        if matched == 0:
            return 0.0

    return matched / max(len(keywords), len(query_tokens))
