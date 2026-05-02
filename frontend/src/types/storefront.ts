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
