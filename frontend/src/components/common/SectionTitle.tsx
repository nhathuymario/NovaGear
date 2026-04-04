interface Props {
    title: string
    subtitle?: string
    action?: React.ReactNode
}

export default function SectionTitle({ title, subtitle, action }: Props) {
    return (
        <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
                <h2 className="text-2xl font-bold">{title}</h2>
                {subtitle && <p className="mt-1 text-sm text-brand-gray">{subtitle}</p>}
            </div>
            {action}
        </div>
    )
}