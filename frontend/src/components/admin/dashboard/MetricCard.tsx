import type {LucideIcon} from "lucide-react"

type MetricCardProps = Readonly<{
    title: string
    value: string
    hint: string
    icon: LucideIcon
}>

export default function MetricCard({title, value, hint, icon: Icon}: MetricCardProps) {
    return (
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</p>
                    <p className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900">{value}</p>
                    <p className="mt-2 text-sm text-slate-500">{hint}</p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Icon size={18}/>
                </span>
            </div>
        </article>
    )
}


