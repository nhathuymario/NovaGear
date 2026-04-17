export type SiteContentKey = "headerTopText" | "headerHotlineText" | "homeFlashSaleText"

const STORAGE_PREFIX = "novagear-site-content:"

const DEFAULT_SITE_CONTENT: Record<SiteContentKey, string> = {
    headerTopText: "Gia tot moi ngay - Ho tro doi tra linh hoat",
    headerHotlineText: "Hotline: 0123 456 789",
    homeFlashSaleText: "Flash deal cuoi tuan - Giam den 20% cho nhieu dong laptop va phu kien.",
}

export function getSiteContent(key: SiteContentKey): string {
    const fallback = DEFAULT_SITE_CONTENT[key]

    if (typeof window === "undefined") {
        return fallback
    }

    const value = localStorage.getItem(STORAGE_PREFIX + key)
    return value && value.trim().length > 0 ? value : fallback
}

export function getAllSiteContent(): Record<SiteContentKey, string> {
    return {
        headerTopText: getSiteContent("headerTopText"),
        headerHotlineText: getSiteContent("headerHotlineText"),
        homeFlashSaleText: getSiteContent("homeFlashSaleText"),
    }
}

export function saveSiteContent(key: SiteContentKey, value: string) {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_PREFIX + key, value.trim())
}

export function saveAllSiteContent(content: Record<SiteContentKey, string>) {
    saveSiteContent("headerTopText", content.headerTopText)
    saveSiteContent("headerHotlineText", content.headerHotlineText)
    saveSiteContent("homeFlashSaleText", content.homeFlashSaleText)
}

