type OrderStatusBadgeProps = Readonly<{
    status?: string
}>

const statusUiMap: Record<string, { label: string; className: string }> = {
    PENDING: {label: "Chờ xác nhận", className: "bg-amber-50 text-amber-700 ring-amber-100"},
    CONFIRMED: {label: "Đã xác nhận", className: "bg-blue-50 text-blue-700 ring-blue-100"},
    SHIPPING: {label: "Đang giao", className: "bg-cyan-50 text-cyan-700 ring-cyan-100"},
    COMPLETED: {label: "Hoàn tất", className: "bg-emerald-50 text-emerald-700 ring-emerald-100"},
    CANCELLED: {label: "Đã hủy", className: "bg-rose-50 text-rose-700 ring-rose-100"},
}

export default function OrderStatusBadge({status}: OrderStatusBadgeProps) {
    const ui = statusUiMap[status ?? ""] ?? {
        label: status || "Không rỏ",
        className: "bg-slate-100 text-slate-700 ring-slate-200",
    }

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${ui.className}`}>
            {ui.label}
        </span>
    )
}


