import { useUIStore } from "../../store/useUIStore"
import { AlertCircle, HelpCircle } from "lucide-react"

export default function ConfirmDialog() {
    const { confirmConfig, resolveConfirm } = useUIStore()

    if (!confirmConfig) return null

    const {
        title = "Xác nhận",
        message,
        confirmText = "Đồng ý",
        cancelText = "Huỷ bỏ",
        danger = false,
    } = confirmConfig

    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div
                className="w-full max-w-md animate-in zoom-in-95 rounded-2xl bg-white p-6 shadow-2xl"
                role="dialog"
                aria-modal="true"
            >
                <div className="mb-5 flex items-start gap-4">
                    <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                            danger ? "bg-red-100 text-red-600" : "bg-blue-100 text-blue-600"
                        }`}
                    >
                        {danger ? <AlertCircle className="h-6 w-6" /> : <HelpCircle className="h-6 w-6" />}
                    </div>
                    <div className="pt-1">
                        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                        <p className="mt-2 text-sm text-gray-600">{message}</p>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={() => resolveConfirm(false)}
                        className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => resolveConfirm(true)}
                        className={`rounded-lg px-4 py-2 text-sm font-medium text-white transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            danger
                                ? "bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-600"
                        }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    )
}
