import { useUIStore } from "../../store/useUIStore"
import { Loader2 } from "lucide-react"

export default function GlobalLoading() {
    const { isLoading, loadingMessage } = useUIStore()

    if (!isLoading) return null

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm transition-opacity">
            <div className="flex flex-col items-center justify-center rounded-2xl bg-white px-8 py-6 shadow-2xl">
                <Loader2 className="mb-4 h-10 w-10 animate-spin text-blue-600" />
                <p className="text-sm font-medium text-gray-700">{loadingMessage || "Đang xử lý..."}</p>
            </div>
        </div>
    )
}
