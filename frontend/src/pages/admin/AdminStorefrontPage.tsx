import {useState, useEffect} from "react"
import {Image, Zap, Gift, Store} from "lucide-react"
import type {
    BannerItem, FlashSaleConfig, PromoItem,
} from "../../types/storefront"
import BannerTab from "./storefront/BannerTab"
import FlashSaleTab from "./storefront/FlashSaleTab"
import PromoTab from "./storefront/PromoTab"
import LogoTab from "./storefront/LogoTab"

const TABS = [
    {id: "banner", label: "Banner", icon: Image},
    {id: "flashsale", label: "Flash Sale", icon: Zap},
    {id: "promo", label: "Ưu đãi & Deal", icon: Gift},
    {id: "logo", label: "Logo Shop", icon: Store},
] as const

type TabId = typeof TABS[number]["id"]

export default function AdminStorefrontPage() {
    const [tab, setTab] = useState<TabId>("banner")
    const [banners, setBanners] = useState<BannerItem[]>([])
    const [flashSale, setFlashSale] = useState<FlashSaleConfig>({mode: "fixed", productIds: [], displayCount: 8, countdownHour: 23, countdownMinute: 59})
    const [promos, setPromos] = useState<PromoItem[]>([])
    const [logoUrl, setLogoUrl] = useState("")

    useEffect(() => {
        // TODO: Fetch from API
        setBanners([])
        setFlashSale({mode: "fixed", productIds: [], displayCount: 8, countdownHour: 23, countdownMinute: 59})
        setPromos([])
        setLogoUrl("")
    }, [])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Quản lý giao diện 🎨</h1>
                <p className="mt-1 text-sm text-slate-500">Tùy chỉnh banner, flash sale, ưu đãi và logo trên storefront</p>
            </div>

            {/* Tab bar */}
            <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                {TABS.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                            tab === t.id ? "bg-admin-accent text-white shadow-md" : "text-slate-600 hover:bg-slate-50"
                        }`}>
                        <t.icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{t.label}</span>
                    </button>
                ))}
            </div>

            {/* Tab content */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm lg:p-6">
                {tab === "banner" && <BannerTab banners={banners} onChange={setBanners} />}
                {tab === "flashsale" && <FlashSaleTab config={flashSale} onChange={setFlashSale} />}
                {tab === "promo" && <PromoTab promos={promos} onChange={setPromos} />}
                {tab === "logo" && <LogoTab logoUrl={logoUrl} onChange={setLogoUrl} />}
            </div>
        </div>
    )
}
