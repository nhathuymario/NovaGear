type Point = Readonly<{
    label: string
    value: number
}>

type SimpleAreaChartProps = Readonly<{
    data: Point[]
    color?: string
    valueFormatter?: (value: number) => string
}>

function buildPath(points: Array<{x: number; y: number}>) {
    if (!points.length) return ""
    return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ")
}

export default function SimpleAreaChart({data, color = "#2563eb", valueFormatter}: SimpleAreaChartProps) {
    const safeData = data.length > 0 ? data : [{label: "N/A", value: 0}]
    const maxValue = Math.max(...safeData.map((item) => item.value), 1)
    const minValue = Math.min(...safeData.map((item) => item.value), 0)
    const range = Math.max(1, maxValue - minValue)

    const width = 100
    const height = 48
    const xStep = safeData.length > 1 ? width / (safeData.length - 1) : width

    const points = safeData.map((item, index) => {
        const x = index * xStep
        const normalized = (item.value - minValue) / range
        const y = height - normalized * (height - 4) - 2
        return {x, y, value: item.value, label: item.label}
    })

    const linePath = buildPath(points)
    const lastPoint = points.at(-1) ?? points[0]
    const areaPath = `${linePath} L${lastPoint.x},${height} L${points[0].x},${height} Z`

    return (
        <div>
            <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full" preserveAspectRatio="none" aria-label="trend chart">
                <defs>
                    <linearGradient id="adminAreaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={color} stopOpacity="0.35"/>
                        <stop offset="100%" stopColor={color} stopOpacity="0.02"/>
                    </linearGradient>
                </defs>
                <path d={areaPath} fill="url(#adminAreaGradient)"/>
                <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
                {points.map((point) => (
                    <circle key={`${point.label}-${point.x}`} cx={point.x} cy={point.y} r="1.2" fill={color}/>
                ))}
            </svg>
            <div className="mt-2 grid grid-cols-4 gap-1 text-xs text-slate-500 sm:grid-cols-7">
                {safeData.map((item) => (
                    <div key={item.label} className="truncate">
                        <div className="font-semibold text-slate-600">{item.label}</div>
                        <div>{valueFormatter ? valueFormatter(item.value) : item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}


