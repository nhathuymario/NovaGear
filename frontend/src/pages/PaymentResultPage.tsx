import { Link, useSearchParams } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { getPaymentByOrderId, mockPaymentSuccess } from "../api/paymentApi"
import { markPaymentSync } from "../utils/paymentSync"

// 1. Định nghĩa interface cho cấu trúc một config
interface StatusConfig {
    icon: string
    colorClass: string
    title: string
    desc: string
}

type DisplayStatus = "success" | "failed" | "pending"

function normalizeDisplayStatus(raw?: string | null): DisplayStatus {
    const value = (raw ?? "").trim().toUpperCase()

    if (["SUCCESS", "SUCCEEDED", "PAID", "COMPLETED", "00"].includes(value)) {
        return "success"
    }

    if (["FAILED", "FAIL", "ERROR", "CANCELLED", "CANCELED"].includes(value)) {
        return "failed"
    }

    return "pending"
}

export default function PaymentResultPage() {
    const [searchParams] = useSearchParams()
    const [resolvedStatus, setResolvedStatus] = useState<DisplayStatus>("pending")
    const [checking, setChecking] = useState(false)

    const orderId = searchParams.get("orderId") || ""
    const status = searchParams.get("status")

    const queryStatus = useMemo(() => normalizeDisplayStatus(status), [status])

    useEffect(() => {
        let mounted = true

        const resolveStatus = async () => {
            if (!orderId) {
                setResolvedStatus(queryStatus)
                return
            }

            if (queryStatus === "success") {
                // Local sandbox fallback: if webhook is not reachable, force-sync payment state.
                try {
                    await mockPaymentSuccess(orderId)
                } catch (error) {
                    console.warn("Mock payment sync skipped", error)
                }
            }

            try {
                setChecking(true)
                const payment = await getPaymentByOrderId(orderId)
                if (!mounted) return

                if (payment?.status) {
                    const nextStatus = normalizeDisplayStatus(payment.status)
                    setResolvedStatus(nextStatus)
                    if (nextStatus === "success") {
                        markPaymentSync(orderId, String(payment.status))
                    }
                    return
                }

                setResolvedStatus(queryStatus)
                if (queryStatus === "success") {
                    markPaymentSync(orderId, "SUCCESS")
                }
            } catch (error) {
                if (!mounted) return
                console.error(error)
                setResolvedStatus(queryStatus)
                if (queryStatus === "success") {
                    markPaymentSync(orderId, "SUCCESS")
                }
            } finally {
                if (mounted) {
                    setChecking(false)
                }
            }
        }

        void resolveStatus()

        return () => {
            mounted = false
        }
    }, [orderId, queryStatus])

    // 2. Ép kiểu Record<string, StatusConfig> để TypeScript hiểu
    // rằng object này có thể truy cập bằng bất kỳ key string nào.
    const configs: Record<DisplayStatus, StatusConfig> = {
        success: {
            icon: "✓",
            colorClass: "bg-green-100 text-green-600",
            title: "Thanh toán thành công",
            desc: "da duoc ghi nhan thanh cong."
        },
        failed: {
            icon: "!",
            colorClass: "bg-red-100 text-red-600",
            title: "Thanh toán thất bại",
            desc: "chua the thanh toan."
        },
        pending: {
            icon: "…",
            colorClass: "bg-yellow-100 text-yellow-700",
            title: "Thanh toán đang chờ xử lý",
            desc: "dang cho cap nhat tu he thong."
        }
    }

    const currentConfig = configs[resolvedStatus]

    return (
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-8 text-center shadow-sm my-10">
            {/* Icon vòng tròn */}
            <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full ${currentConfig.colorClass}`}>
                <span className="text-3xl font-bold">{currentConfig.icon}</span>
            </div>

            {/* Tiêu đề */}
            <h1 className="mt-6 text-3xl font-bold">{currentConfig.title}</h1>

            {/* Nội dung mô tả */}
            <p className="mt-3 text-brand-gray">
                {orderId ? `Đơn hàng #${orderId}` : "Đơn hàng của bạn"}{" "}
                {currentConfig.desc}
            </p>

            {checking && (
                <p className="mt-2 text-sm text-slate-500">Dang dong bo trang thai thanh toan...</p>
            )}

            {/* Các nút hành động */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
                {orderId && (
                    <Link
                        to={`/orders/${orderId}`}
                        className="rounded-xl bg-brand-dark px-5 py-3 font-semibold text-white transition-all hover:bg-opacity-90"
                    >
                        Xem chi tiết đơn
                    </Link>
                )}

                <Link
                    to="/orders"
                    className="rounded-xl border border-brand-dark px-5 py-3 font-semibold text-brand-dark transition-all hover:bg-gray-50"
                >
                    Đơn hàng của tôi
                </Link>

                <Link
                    to="/"
                    className="rounded-xl border border-gray-200 px-5 py-3 font-semibold text-gray-600 transition-all hover:bg-gray-50"
                >
                    Về trang chủ
                </Link>
            </div>
        </div>
    )
}