import type {ReactNode} from "react"

type SectionCardProps = Readonly<{
    title: string
    description?: string
    action?: ReactNode
    children: ReactNode
}>

export default function SectionCard({title, description, action, children}: SectionCardProps) {
    return (
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <header className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
                <div>
                    <h2 className="text-base font-bold text-slate-900">{title}</h2>
                    {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
                </div>
                {action ? <div className="shrink-0">{action}</div> : null}
            </header>
            <div className="p-5">{children}</div>
        </section>
    )
}


