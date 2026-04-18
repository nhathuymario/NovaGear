type DonutItem = Readonly<{
    label: string
    value: number
    color: string
}>

type SimpleDonutChartProps = Readonly<{
    data: DonutItem[]
    size?: number
    strokeWidth?: number
}>

export default function SimpleDonutChart({data, size = 164, strokeWidth = 18}: SimpleDonutChartProps) {
    const safeData = data.filter((item) => item.value > 0)
    const total = safeData.reduce((sum, item) => sum + item.value, 0)

    if (!total) {
        return (
            <div
                className="flex h-44 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                Chưa có dữ liệu biểu đồ.
            </div>
        )
    }

    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    let accumulated = 0

    return (
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="relative">
                <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="donut chart">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke="#e2e8f0"
                        strokeWidth={strokeWidth}
                    />
                    {safeData.map((item) => {
                        const arc = (item.value / total) * circumference
                        const strokeDasharray = `${arc} ${circumference - arc}`
                        const strokeDashoffset = -accumulated
                        accumulated += arc

                        return (
                            <circle
                                key={item.label}
                                cx={size / 2}
                                cy={size / 2}
                                r={radius}
                                fill="transparent"
                                stroke={item.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                transform={`rotate(-90 ${size / 2} ${size / 2})`}
                                strokeLinecap="butt"
                            />
                        )
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <div className="text-2xl font-extrabold text-slate-900">{total}</div>
                    <div className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Tong</div>
                </div>
            </div>

            <div className="w-full space-y-2">
                {safeData.map((item) => {
                    const percent = Math.round((item.value / total) * 100)
                    return (
                        <div key={item.label} className="flex items-center justify-between gap-2 text-sm">
                            <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 rounded-full" style={{backgroundColor: item.color}}/>
                                <span className="text-slate-600">{item.label}</span>
                            </div>
                            <div className="font-semibold text-slate-900">{item.value} ({percent}%)</div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}


