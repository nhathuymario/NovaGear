import type {SyntheticEvent} from "react"

const FALLBACK_SVG = (label: string) => `
<svg width="600" height="600" viewBox="0 0 600 600" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#F8FAFC"/>
      <stop offset="100%" stop-color="#E2E8F0"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#334155"/>
    </linearGradient>
  </defs>
  <rect width="600" height="600" rx="48" fill="url(#bg)"/>
  <circle cx="300" cy="230" r="88" fill="url(#accent)" opacity="0.12"/>
  <path d="M210 244C210 194.294 250.294 154 300 154C349.706 154 390 194.294 390 244V305C390 316.046 381.046 325 370 325H230C218.954 325 210 316.046 210 305V244Z" fill="#CBD5E1"/>
  <path d="M238 274C238 262.954 246.954 254 258 254H342C353.046 254 362 262.954 362 274V312H238V274Z" fill="#94A3B8"/>
  <rect x="196" y="336" width="208" height="140" rx="24" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="4"/>
  <rect x="222" y="364" width="156" height="16" rx="8" fill="#CBD5E1"/>
  <rect x="222" y="394" width="120" height="16" rx="8" fill="#E2E8F0"/>
  <rect x="222" y="424" width="90" height="16" rx="8" fill="#E2E8F0"/>
  <text x="300" y="548" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="#0F172A">${label}</text>
</svg>`

function encodeSvg(svg: string) {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

export function getFallbackImageSrc(label = "NovaGear") {
    return encodeSvg(FALLBACK_SVG(label))
}

export function normalizeUploadImageUrl(src?: string | null): string {
    if (!src?.trim()) return ""

    const normalized = src.trim()
    if (import.meta.env.DEV) {
        if (normalized.startsWith("/api-upload/uploads/")) {
            return normalized
        }

        if (
            normalized.startsWith("http://localhost:5173/api/uploads/") ||
            normalized.startsWith("http://localhost:8089/api/uploads/") ||
            normalized.startsWith("http://localhost:8083/api/uploads/")
        ) {
            return normalized.replace(/https?:\/\/localhost:\d+\/api\/uploads\//, "/api-upload/uploads/")
        }

        if (normalized.startsWith("/api/uploads/")) {
            return normalized.replace("/api/uploads/", "/api-upload/uploads/")
        }

        if (normalized.startsWith("/uploads/")) {
            return normalized.replace("/uploads/", "/api-upload/uploads/")
        }
    }

    return normalized
}

export function getImageSrc(src?: string | null, fallbackLabel = "NovaGear") {
    const normalized = normalizeUploadImageUrl(src)
    return normalized || getFallbackImageSrc(fallbackLabel)
}

export function handleImageError(event: SyntheticEvent<HTMLImageElement>) {
    const target = event.currentTarget
    const fallback = target.dataset.fallback ?? getFallbackImageSrc()

    if (target.src !== fallback) {
        target.src = fallback
    }
}


