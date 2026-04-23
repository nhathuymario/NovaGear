interface SkeletonBlockProps {
    readonly className?: string
}

function SkeletonBlock({className = ""}: Readonly<SkeletonBlockProps>) {
    return <div className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`.trim()}/>
}

export function HeroSkeleton() {
    return (
        <div
            className="overflow-hidden rounded-[32px] border border-white/20 bg-white/8 p-6 shadow-2xl backdrop-blur md:p-8">
            <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                    <SkeletonBlock className="h-6 w-40 rounded-full bg-white/20"/>
                    <SkeletonBlock className="h-16 w-full bg-white/15"/>
                    <SkeletonBlock className="h-4 w-11/12 bg-white/15"/>
                    <SkeletonBlock className="h-4 w-9/12 bg-white/15"/>
                    <div className="flex gap-3 pt-2">
                        <SkeletonBlock className="h-12 w-32 rounded-2xl bg-white/20"/>
                        <SkeletonBlock className="h-12 w-32 rounded-2xl bg-white/10"/>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {Array.from({length: 4}).map((_, index) => (
                        <SkeletonBlock key={index} className="aspect-[4/3] rounded-3xl bg-white/15"/>
                    ))}
                </div>
            </div>
        </div>
    )
}

export function ProductGridSkeleton({count = 8}: Readonly<{ count?: number }>) {
    return (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {Array.from({length: count}).map((_, index) => (
                <div key={index} className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
                    <SkeletonBlock className="aspect-square rounded-none bg-slate-200"/>
                    <div className="space-y-3 p-4">
                        <SkeletonBlock className="h-4 w-5/6"/>
                        <SkeletonBlock className="h-6 w-3/5"/>
                        <div className="flex items-center justify-between gap-2 pt-1">
                            <SkeletonBlock className="h-8 w-20 rounded-full"/>
                            <SkeletonBlock className="h-9 w-20 rounded-xl"/>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function ProductListSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
            <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
                <SkeletonBlock className="h-6 w-32"/>
                <div className="mt-4 space-y-3">
                    {Array.from({length: 5}).map((_, index) => (
                        <SkeletonBlock key={index} className="h-12 w-full rounded-2xl"/>
                    ))}
                </div>
            </aside>
            <section className="space-y-4">
                <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                    <SkeletonBlock className="h-8 w-56"/>
                    <SkeletonBlock className="mt-3 h-4 w-72"/>
                </div>
                <ProductGridSkeleton/>
            </section>
        </div>
    )
}

export function ProductDetailSkeleton() {
    return (
        <div className="space-y-6">
            <div
                className="grid gap-6 rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
                <div className="space-y-4">
                    <SkeletonBlock className="aspect-square rounded-[28px] bg-slate-200"/>
                    <div className="grid grid-cols-4 gap-3">
                        {Array.from({length: 4}).map((_, index) => (
                            <SkeletonBlock key={index} className="aspect-square rounded-2xl bg-slate-200"/>
                        ))}
                    </div>
                </div>
                <div className="space-y-5">
                    <SkeletonBlock className="h-9 w-4/5"/>
                    <SkeletonBlock className="h-4 w-full"/>
                    <SkeletonBlock className="h-4 w-10/12"/>
                    <SkeletonBlock className="h-10 w-40"/>
                    <SkeletonBlock className="h-40 w-full rounded-[28px]"/>
                    <SkeletonBlock className="h-28 w-full rounded-[28px]"/>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
                <SkeletonBlock className="h-48 rounded-[28px] bg-white"/>
                <SkeletonBlock className="h-48 rounded-[28px] bg-white"/>
            </div>
        </div>
    )
}

export function CartSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-[1fr_320px]">
            <section className="space-y-4">
                <SkeletonBlock className="h-8 w-48"/>
                {Array.from({length: 3}).map((_, index) => (
                    <div key={index}
                         className="flex gap-4 rounded-[28px] border border-slate-100 bg-white p-4 shadow-sm">
                        <SkeletonBlock className="h-24 w-24 rounded-2xl"/>
                        <div className="flex-1 space-y-3">
                            <SkeletonBlock className="h-5 w-3/4"/>
                            <SkeletonBlock className="h-4 w-1/2"/>
                            <SkeletonBlock className="h-4 w-1/3"/>
                            <div className="flex items-center gap-2 pt-2">
                                <SkeletonBlock className="h-9 w-9 rounded-xl"/>
                                <SkeletonBlock className="h-5 w-8"/>
                                <SkeletonBlock className="h-9 w-9 rounded-xl"/>
                            </div>
                        </div>
                        <SkeletonBlock className="h-9 w-9 rounded-xl"/>
                    </div>
                ))}
            </section>
            <aside className="h-fit rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                <SkeletonBlock className="h-7 w-44"/>
                <div className="mt-4 space-y-3">
                    <SkeletonBlock className="h-5 w-full"/>
                    <SkeletonBlock className="h-5 w-full"/>
                    <SkeletonBlock className="h-5 w-full"/>
                </div>
                <SkeletonBlock className="mt-5 h-12 w-full rounded-2xl"/>
            </aside>
        </div>
    )
}

export function OrdersSkeleton() {
    return (
        <div className="space-y-4">
            <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
                <SkeletonBlock className="h-8 w-56"/>
                <div className="mt-4 flex flex-wrap gap-2">
                    {Array.from({length: 6}).map((_, index) => (
                        <SkeletonBlock key={index} className="h-8 w-24 rounded-full"/>
                    ))}
                </div>
            </div>

            {Array.from({length: 3}).map((_, index) => (
                <div key={index} className="rounded-[28px] border border-slate-100 bg-white p-5 shadow-sm">
                    <div className="grid gap-4 md:grid-cols-4">
                        {Array.from({length: 4}).map((__, innerIndex) => (
                            <div key={innerIndex} className="space-y-2">
                                <SkeletonBlock className="h-4 w-20"/>
                                <SkeletonBlock className="h-5 w-full"/>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        {Array.from({length: 2}).map((__, innerIndex) => (
                            <SkeletonBlock key={innerIndex} className="h-24 rounded-2xl"/>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}

export function ProfileSkeleton() {
    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
                <SkeletonBlock className="h-10 w-72"/>
                <SkeletonBlock className="mt-3 h-4 w-96"/>
                <div className="mt-5 flex items-center gap-4 rounded-[28px] bg-slate-50 p-4">
                    <SkeletonBlock className="h-16 w-16 rounded-full"/>
                    <div className="space-y-2">
                        <SkeletonBlock className="h-5 w-40"/>
                        <SkeletonBlock className="h-4 w-52"/>
                    </div>
                </div>
            </div>

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6 rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
                    <SkeletonBlock className="h-8 w-56"/>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {Array.from({length: 6}).map((_, index) => (
                            <SkeletonBlock key={index} className="h-24 rounded-[24px]"/>
                        ))}
                    </div>
                    <SkeletonBlock className="h-48 rounded-[28px]"/>
                </div>
                <div className="h-fit rounded-[32px] border border-slate-100 bg-white p-6 shadow-sm">
                    <SkeletonBlock className="h-8 w-40"/>
                    <div className="mt-4 space-y-3">
                        {Array.from({length: 3}).map((_, index) => (
                            <SkeletonBlock key={index} className="h-12 rounded-2xl"/>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

