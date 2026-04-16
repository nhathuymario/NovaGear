import type {LucideIcon} from "lucide-react"
import {ArrowUpRight} from "lucide-react"
import {Link} from "react-router-dom"

type QuickActionTileProps = Readonly<{
    to: string
    label: string
    title: string
    icon: LucideIcon
}>

export default function QuickActionTile({to, label, title, icon: Icon}: QuickActionTileProps) {
    return (
        <Link
            to={to}
            className="group rounded-2xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-blue-200 hover:bg-blue-50/70"
        >
            <div className="flex items-center justify-between gap-3">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm group-hover:text-blue-600">
                    <Icon size={17}/>
                </span>
                <ArrowUpRight size={16} className="text-slate-400 transition group-hover:text-blue-600"/>
            </div>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{title}</p>
        </Link>
    )
}


