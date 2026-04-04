import { Link, useSearchParams } from "react-router-dom";

// 1. Định nghĩa interface cho cấu trúc một config
interface StatusConfig {
    icon: string;
    colorClass: string;
    title: string;
    desc: string;
}

export default function PaymentResultPage() {
    const [searchParams] = useSearchParams();

    const orderId = searchParams.get("orderId") || "";
    const status = (searchParams.get("status") || "pending").toLowerCase();

    // 2. Ép kiểu Record<string, StatusConfig> để TypeScript hiểu
    // rằng object này có thể truy cập bằng bất kỳ key string nào.
    const configs: Record<string, StatusConfig> = {
        success: {
            icon: "✓",
            colorClass: "bg-green-100 text-green-600",
            title: "Thanh toán thành công",
            desc: "đã được ghi nhận thành công."
        },
        failed: {
            icon: "!",
            colorClass: "bg-red-100 text-red-600",
            title: "Thanh toán thất bại",
            desc: "chưa thể thanh toán."
        },
        pending: {
            icon: "…",
            colorClass: "bg-yellow-100 text-yellow-700",
            title: "Thanh toán đang chờ xử lý",
            desc: "đang chờ cập nhật từ hệ thống."
        }
    };

    // 3. Bây giờ truy cập configs[status] sẽ không bị báo lỗi "any" nữa
    const currentConfig = configs[status] || configs.pending;

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
    );
}