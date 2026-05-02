import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ArrowRight, ChevronLeft, ChevronRight, Flame, Gift, Timer, Zap, Star, Heart, Tag, Percent, ShoppingBag, Award } from "lucide-react"
import { getProducts, getPublicCategories } from "../api/productApi"
import type { Product, PublicCategory } from "../types/product"
import { getSiteContent } from "../utils/siteContent"
import { getBanners, getFlashSaleConfig, getPromos, shuffleArray, type BannerItem, type PromoItem } from "../utils/storefrontConfig"
import ProductCard from "../components/product/ProductCard"
import { ProductGridSkeleton } from "../components/ui/Skeletons"

const CATEGORY_ICONS: Record<string, string> = {
    "laptop": "💻",
    "pc": "🖥️",
    "man-hinh": "🖥️",
    "ban-phim": "⌨️",
    "tai-nghe": "🎧",
    "chuot": "🖱️",
    "loa": "🔊",
    "phu-kien": "🔌",
    "dien-thoai": "📱",
    "tablet": "📱",
    "camera": "📷",
    "smartwatch": "⌚",
}

function getCategoryIcon(slug: string): string {
    const key = Object.keys(CATEGORY_ICONS).find(k => slug.toLowerCase().includes(k))
    return key ? CATEGORY_ICONS[key] : "📦"
}

const PROMO_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    Gift, Zap, Flame, Timer, Star, Heart, Tag, Percent, ShoppingBag, Award,
}

// Countdown timer hook - returns timeLeft + fires onExpire once
function useCountdown(targetHour = 23, targetMinute = 59, onExpire?: () => void) {
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 })
    const firedRef = useRef(false)

    useEffect(() => {
        firedRef.current = false
    }, [targetHour, targetMinute])

    useEffect(() => {
        const calc = () => {
            const now = new Date()
            const target = new Date()
            target.setHours(targetHour, targetMinute, 59, 999)
            if (now > target) target.setDate(target.getDate() + 1)
            const diff = target.getTime() - now.getTime()
            const tl = {
                hours: Math.floor(diff / 3600000),
                minutes: Math.floor((diff % 3600000) / 60000),
                seconds: Math.floor((diff % 60000) / 1000),
            }
            setTimeLeft(tl)
            if (tl.hours === 0 && tl.minutes === 0 && tl.seconds === 0 && !firedRef.current) {
                firedRef.current = true
                onExpire?.()
            } else if (tl.seconds > 0) {
                firedRef.current = false
            }
        }
        calc()
        const interval = setInterval(calc, 1000)
        return () => clearInterval(interval)
    }, [targetHour, targetMinute, onExpire])

    return timeLeft
}

export default function HomePage() {
    const [products, setProducts] = useState<Product[]>([])
    const [categories, setCategories] = useState<PublicCategory[]>([])
    const [loading, setLoading] = useState(true)
    const flashSaleText = getSiteContent("homeFlashSaleText")

    // Storefront config
    const [banners] = useState<BannerItem[]>(() => getBanners())
    const [flashSaleConfig] = useState(() => getFlashSaleConfig())
    const [promos] = useState<PromoItem[]>(() => getPromos())
    const [flashSaleRound, setFlashSaleRound] = useState(0)

    const handleCountdownExpire = useCallback(() => {
        if (flashSaleConfig.mode === "random") setFlashSaleRound(r => r + 1)
    }, [flashSaleConfig.mode])

    const countdown = useCountdown(flashSaleConfig.countdownHour, flashSaleConfig.countdownMinute, handleCountdownExpire)

    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
        Autoplay({ delay: 4000, stopOnInteraction: false }),
    ])

    const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
    const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

    useEffect(() => {
        Promise.all([getProducts(), getPublicCategories()])
            .then(([productData, categoryData]) => {
                setProducts(productData)
                setCategories(categoryData)
            })
            .finally(() => setLoading(false))
    }, [])

    const featuredProducts = useMemo(() => {
        const featured = products.filter(p => p.featured)
        return featured.length > 0 ? featured.slice(0, 12) : products.slice(0, 12)
    }, [products])

    const saleProducts = useMemo(() => {
        const allSale = products.filter(p => p.salePrice != null && p.salePrice < p.price)
        // If admin selected specific products, use those
        if (flashSaleConfig.productIds.length > 0) {
            const selected = flashSaleConfig.productIds
                .map(id => products.find(p => String(p.id) === id))
                .filter((p): p is Product => p != null)
            const pool = selected.length > 0 ? selected : allSale
            if (flashSaleConfig.mode === "random") {
                // flashSaleRound forces re-shuffle
                void flashSaleRound
                return shuffleArray(pool).slice(0, flashSaleConfig.displayCount)
            }
            return pool.slice(0, flashSaleConfig.displayCount)
        }
        if (flashSaleConfig.mode === "random") {
            void flashSaleRound
            return shuffleArray(allSale).slice(0, flashSaleConfig.displayCount)
        }
        return allSale.slice(0, 8)
    }, [products, flashSaleConfig, flashSaleRound])

    const pad = (n: number) => String(n).padStart(2, "0")

    return (
        <div className="space-y-5">
            {/* ===== HERO SECTION: Banner + Category sidebar ===== */}
            <section className="grid gap-4 lg:grid-cols-[260px_1fr]">
                {/* Category sidebar (desktop) */}
                <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white lg:block">
                    <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                        <h3 className="text-sm font-bold text-slate-900">Danh mục sản phẩm</h3>
                    </div>
                    <nav className="p-2">
                        {categories.slice(0, 10).map((cat) => (
                            <Link
                                key={cat.id}
                                to={`/products?category=${encodeURIComponent(cat.slug)}`}
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-brand-yellow/10 hover:text-brand-dark"
                            >
                                <span>{getCategoryIcon(cat.slug)}</span>
                                <span className="flex-1 font-medium">{cat.name}</span>
                                <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
                            </Link>
                        ))}
                        <Link
                            to="/products"
                            className="mt-1 flex items-center justify-center gap-1 rounded-lg bg-slate-50 px-3 py-2 text-xs font-semibold text-brand-blue transition hover:bg-brand-blue/10"
                        >
                            Xem tất cả <ArrowRight className="h-3 w-3" />
                        </Link>
                    </nav>
                </div>

                {/* Banner carousel */}
                <div className="relative overflow-hidden rounded-xl">
                    <div ref={emblaRef} className="embla">
                        <div className="embla__container">
                            {banners.map((banner) => (
                                <div key={banner.id} className="embla__slide">
                                    <Link
                                        to={banner.linkUrl}
                                        className={`relative flex min-h-[280px] items-center ${banner.imageUrl ? '' : `bg-gradient-to-br ${banner.bgGradient}`} p-8 md:min-h-[340px] md:p-12`}
                                    >
                                        {banner.imageUrl && (
                                            <img src={banner.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                                        )}
                                        <div className={`relative z-10 max-w-lg ${banner.imageUrl ? 'drop-shadow-lg' : ''}`}>
                                            <h2 className={`whitespace-pre-line text-3xl font-black leading-tight md:text-4xl ${banner.accentColor}`}>
                                                {banner.title}
                                            </h2>
                                            <p className="mt-3 text-sm text-white/80 md:text-base">
                                                {banner.subtitle}
                                            </p>
                                            {banner.hideButton !== true && (
                                                <div className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-brand-dark transition hover:bg-brand-yellow">
                                                    {banner.buttonText || "Mua ngay"}
                                                    <ArrowRight className="h-4 w-4" />
                                                </div>
                                            )}
                                        </div>
                                        {banner.imageUrl && banner.dimImage !== false && <div className="absolute inset-0 bg-black/30" />}
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button onClick={scrollPrev} className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md transition hover:bg-white">
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button onClick={scrollNext} className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-md transition hover:bg-white">
                        <ChevronRight className="h-4 w-4" />
                    </button>
                </div>
            </section>

            {/* ===== PROMO BANNERS ROW ===== */}
            <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {promos.map((promo) => {
                    const IconComp = PROMO_ICONS[promo.icon] || Gift
                    return (
                        <Link
                            key={promo.id}
                            to={promo.linkUrl}
                            className={`flex items-center gap-3 rounded-xl border border-slate-100 ${promo.colorBg} ${promo.colorText} px-4 py-3 text-sm font-semibold transition hover:shadow-md`}
                        >
                            <IconComp className="h-5 w-5" />
                            {promo.text}
                        </Link>
                    )
                })}
            </section>

            {/* ===== CATEGORY GRID (mobile) ===== */}
            <motion.section
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border border-slate-200 bg-white p-4 lg:hidden"
            >
                <h2 className="mb-3 text-base font-bold text-slate-900">Danh mục sản phẩm</h2>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                    {categories.slice(0, 10).map((cat) => (
                        <Link
                            key={cat.id}
                            to={`/products?category=${encodeURIComponent(cat.slug)}`}
                            className="flex flex-col items-center gap-1.5 rounded-lg p-2 text-center transition hover:bg-brand-yellow/10"
                        >
                            <span className="text-2xl">{getCategoryIcon(cat.slug)}</span>
                            <span className="text-[11px] font-medium text-slate-700">{cat.name}</span>
                        </Link>
                    ))}
                </div>
            </motion.section>

            {/* ===== FLASH SALE SECTION ===== */}
            {saleProducts.length > 0 && (
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden rounded-xl border border-red-200 bg-gradient-to-r from-red-50 via-white to-red-50"
                >
                    <div
                        className="flex flex-wrap items-center justify-between gap-3 border-b border-red-100 bg-gradient-to-r from-brand-red to-red-600 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <Zap className="h-5 w-5 text-brand-yellow" />
                            <h2 className="text-lg font-black text-white">FLASH SALE</h2>
                            <div className="flex items-center gap-1">
                                <span className="countdown-digit">{pad(countdown.hours)}</span>
                                <span className="text-sm font-bold text-white">:</span>
                                <span className="countdown-digit">{pad(countdown.minutes)}</span>
                                <span className="text-sm font-bold text-white">:</span>
                                <span className="countdown-digit">{pad(countdown.seconds)}</span>
                            </div>
                        </div>
                        <Link to="/products"
                            className="text-xs font-semibold text-white/90 transition hover:text-white">
                            Xem tất cả →
                        </Link>
                    </div>
                    <div className="flex gap-3 overflow-x-auto p-4 scrollbar-hide">
                        {saleProducts.map((product) => (
                            <div key={product.id} className="w-[180px] shrink-0 md:w-[200px]">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-red-100 bg-red-50/50 px-4 py-2">
                        <p className="text-xs text-red-700">{flashSaleText}</p>
                    </div>
                </motion.section>
            )}

            {/* ===== 3D TECH SHOWCASE ===== */}
            {/*<motion.section*/}
            {/*    initial={{opacity: 0, y: 16}}*/}
            {/*    whileInView={{opacity: 1, y: 0}}*/}
            {/*    viewport={{once: true}}*/}
            {/*    transition={{duration: 0.35}}*/}
            {/*    className="overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 p-6 text-white shadow-xl md:p-8"*/}
            {/*>*/}
            {/*    <div className="grid items-center gap-8 md:grid-cols-[1.15fr_0.85fr]">*/}
            {/*        <div className="max-w-xl space-y-5">*/}
            {/*            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-white/80 backdrop-blur">*/}
            {/*                NovaGear Premium*/}
            {/*            </div>*/}
            {/*            <h2 className="text-3xl font-black leading-tight md:text-5xl">*/}
            {/*                Công nghệ xịn, trải nghiệm mượt*/}
            {/*            </h2>*/}
            {/*            <p className="text-sm leading-relaxed text-slate-300">*/}
            {/*                Mua sắm công nghệ với giá tốt nhất, bảo hành chính hãng, giao hàng nhanh chóng.*/}
            {/*            </p>*/}
            {/*            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">*/}
            {/*                {[*/}
            {/*                    ["1000+", "Sản phẩm"],*/}
            {/*                    ["2h", "Giao nhanh"],*/}
            {/*                    ["100%", "Chính hãng"],*/}
            {/*                    ["24/7", "Hỗ trợ"],*/}
            {/*                ].map(([value, label]) => (*/}
            {/*                    <div key={label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center backdrop-blur">*/}
            {/*                        <p className="text-xl font-black text-brand-yellow">{value}</p>*/}
            {/*                        <p className="text-[10px] text-slate-300">{label}</p>*/}
            {/*                    </div>*/}
            {/*                ))}*/}
            {/*            </div>*/}
            {/*            <Link*/}
            {/*                to="/products"*/}
            {/*                className="inline-flex items-center gap-2 rounded-lg bg-brand-yellow px-5 py-3 text-sm font-bold text-brand-dark transition hover:brightness-95"*/}
            {/*            >*/}
            {/*                Khám phá ngay*/}
            {/*                <ArrowRight className="h-4 w-4" />*/}
            {/*            </Link>*/}
            {/*        </div>*/}
            {/*        <TechShowcase3D />*/}
            {/*    </div>*/}
            {/*</motion.section>*/}

            {/* ===== FEATURED PRODUCTS ===== */}
            <motion.section
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border border-slate-200 bg-white p-4"
            >
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Sản phẩm nổi bật</h2>
                        <p className="mt-0.5 text-xs text-slate-500">Được yêu thích nhất tại NovaGear</p>
                    </div>
                    <Link to="/products"
                        className="text-sm font-semibold text-brand-blue transition hover:text-brand-blue/80">
                        Xem tất cả →
                    </Link>
                </div>

                {loading ? (
                    <ProductGridSkeleton count={12} />
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {featuredProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}

                {!loading && products.length > 12 && (
                    <div className="mt-4 text-center">
                        <Link
                            to="/products"
                            className="inline-flex items-center gap-2 rounded-lg border border-brand-blue px-6 py-2.5 text-sm font-semibold text-brand-blue transition hover:bg-brand-blue hover:text-white"
                        >
                            Xem thêm sản phẩm
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                )}
            </motion.section>
        </div>
    )
}