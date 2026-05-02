// ===== Storefront Configuration =====
// Manages banners, flash sale, promo sections, and shop logo.
// All data is persisted in localStorage.

const STORAGE_PREFIX = "novagear-storefront:"

// ---------- Types ----------

export interface BannerItem {
    id: string
    title: string
    subtitle: string
    imageUrl: string        // uploaded image URL (empty = use gradient)
    linkUrl: string         // navigation link
    bgGradient: string      // fallback TailwindCSS gradient classes
    accentColor: string     // text color class
}

export interface FlashSaleConfig {
    mode: "fixed" | "random"   // fixed = always show same, random = shuffle after countdown
    productIds: string[]       // selected product IDs
    displayCount: number       // how many to show at once (when random)
    countdownHour: number      // countdown target hour (default 23)
    countdownMinute: number    // countdown target minute (default 59)
}

export interface PromoItem {
    id: string
    icon: string        // lucide icon name
    text: string        // display text
    colorBg: string     // bg color class
    colorText: string   // text color class
    linkUrl: string     // navigation link
}

export interface StorefrontConfig {
    banners: BannerItem[]
    flashSale: FlashSaleConfig
    promos: PromoItem[]
    logoUrl: string     // shop logo URL (empty = use default "NG" text)
}

// ---------- Defaults ----------

const DEFAULT_BANNERS: BannerItem[] = [
    {
        id: "banner-1",
        title: "Laptop Gaming\nGiảm Sốc 30%",
        subtitle: "Trả góp 0% - Tặng balo + chuột gaming",
        imageUrl: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1200&h=400&fit=crop",
        linkUrl: "/products?category=laptop",
        bgGradient: "from-slate-900 via-blue-900 to-indigo-900",
        accentColor: "text-brand-yellow",
    },
    {
        id: "banner-2",
        title: "Phụ Kiện Hot\nMua 2 Giảm 20%",
        subtitle: "Tai nghe, bàn phím, chuột - Hàng chính hãng",
        imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93100316e6?w=1200&h=400&fit=crop",
        linkUrl: "/products?category=phu-kien",
        bgGradient: "from-emerald-900 via-teal-800 to-cyan-900",
        accentColor: "text-emerald-300",
    },
    {
        id: "banner-3",
        title: "PC Văn Phòng\nGiá Từ 8 Triệu",
        subtitle: "Cấu hình mạnh - Bảo hành 36 tháng",
        imageUrl: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?w=1200&h=400&fit=crop",
        linkUrl: "/products?category=pc",
        bgGradient: "from-violet-900 via-purple-800 to-fuchsia-900",
        accentColor: "text-violet-300",
    },
]

const DEFAULT_FLASH_SALE: FlashSaleConfig = {
    mode: "random",
    productIds: [],
    displayCount: 8,
    countdownHour: 23,
    countdownMinute: 59,
}

const DEFAULT_PROMOS: PromoItem[] = [
    {id: "promo-1", icon: "Gift", text: "Ưu đãi sinh viên", colorBg: "bg-violet-50", colorText: "text-violet-700", linkUrl: "/products"},
    {id: "promo-2", icon: "Zap", text: "Deal sốc mỗi ngày", colorBg: "bg-amber-50", colorText: "text-amber-700", linkUrl: "/products"},
    {id: "promo-3", icon: "Flame", text: "Sản phẩm hot", colorBg: "bg-red-50", colorText: "text-red-700", linkUrl: "/products"},
    {id: "promo-4", icon: "Timer", text: "Trả góp 0%", colorBg: "bg-emerald-50", colorText: "text-emerald-700", linkUrl: "/products"},
]

const DEFAULT_CONFIG: StorefrontConfig = {
    banners: DEFAULT_BANNERS,
    flashSale: DEFAULT_FLASH_SALE,
    promos: DEFAULT_PROMOS,
    logoUrl: "https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=150&h=50&fit=crop",
}

// ---------- Read / Write ----------

function readFromStorage<T>(key: string, fallback: T): T {
    try {
        const raw = localStorage.getItem(STORAGE_PREFIX + key)
        if (!raw) return fallback
        return JSON.parse(raw) as T
    } catch {
        return fallback
    }
}

function writeToStorage<T>(key: string, value: T) {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value))
}

// ---------- Public API ----------

export function getStorefrontConfig(): StorefrontConfig {
    return {
        banners: readFromStorage<BannerItem[]>("banners", DEFAULT_BANNERS),
        flashSale: readFromStorage<FlashSaleConfig>("flashSale", DEFAULT_FLASH_SALE),
        promos: readFromStorage<PromoItem[]>("promos", DEFAULT_PROMOS),
        logoUrl: readFromStorage<string>("logoUrl", ""),
    }
}

export function getBanners(): BannerItem[] {
    return readFromStorage<BannerItem[]>("banners", DEFAULT_BANNERS)
}

export function saveBanners(banners: BannerItem[]) {
    writeToStorage("banners", banners)
}

export function getFlashSaleConfig(): FlashSaleConfig {
    return readFromStorage<FlashSaleConfig>("flashSale", DEFAULT_FLASH_SALE)
}

export function saveFlashSaleConfig(config: FlashSaleConfig) {
    writeToStorage("flashSale", config)
}

export function getPromos(): PromoItem[] {
    return readFromStorage<PromoItem[]>("promos", DEFAULT_PROMOS)
}

export function savePromos(promos: PromoItem[]) {
    writeToStorage("promos", promos)
}

export function getLogoUrl(): string {
    return readFromStorage<string>("logoUrl", "")
}

export function saveLogoUrl(url: string) {
    writeToStorage("logoUrl", url)
}

// ---------- Flash Sale Helpers ----------

/** Shuffle an array (Fisher-Yates) */
export function shuffleArray<T>(arr: T[]): T[] {
    const copy = [...arr]
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]]
    }
    return copy
}

/** Generate a unique ID */
export function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// ---------- Default Getters (for reset) ----------

export function getDefaultBanners(): BannerItem[] {
    return JSON.parse(JSON.stringify(DEFAULT_BANNERS))
}

export function getDefaultPromos(): PromoItem[] {
    return JSON.parse(JSON.stringify(DEFAULT_PROMOS))
}

export function getDefaultFlashSaleConfig(): FlashSaleConfig {
    return {...DEFAULT_FLASH_SALE, productIds: []}
}
