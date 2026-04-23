export default function StatusBadge({status}: { status?: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        ACTIVE: {label: "Hoạt động", cls: "bg-emerald-50 text-emerald-700 border-emerald-200"},
        DRAFT: {label: "Nháp", cls: "bg-amber-50 text-amber-700 border-amber-200"},
        INACTIVE: {label: "Ẩn", cls: "bg-gray-100 text-gray-500 border-gray-200"},
        OUT_OF_STOCK: {label: "Hết hàng", cls: "bg-red-50 text-red-600 border-red-200"},
    }

    const s =
        map[status ?? ""] ?? {
            label: status ?? "—",
            cls: "bg-gray-100 text-gray-500 border-gray-200",
        }

    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${s.cls}`}>
            {s.label}
        </span>
    )
}


