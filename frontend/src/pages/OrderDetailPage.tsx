import { useUIStore } from "../store/useUIStore";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { cancelMyOrder, getOrderDetail } from "../api/orderApi";
import type { Order } from "../types/order";
import { getToken } from "../utils/auth";
import { getFallbackImageSrc, handleImageError } from "../utils/image";
import { readPaymentSync } from "../utils/paymentSync";

function getStatusText(status: Order["status"]) {
  switch (status) {
    case "PENDING":
      return "Chờ xác nhận";
    case "CONFIRMED":
      return "Đã xác nhận";
    case "SHIPPING":
      return "Đang giao";
    case "COMPLETED":
      return "Đã giao";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status;
  }
}

function formatCurrency(value: number) {
  return value.toLocaleString("vi-VN") + "đ";
}

export default function OrderDetailPage() {
  const { requestConfirm } = useUIStore();

  const { id = "" } = useParams();
  const navigate = useNavigate();
  const token = getToken();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(Boolean(token && id));
  const [cancelling, setCancelling] = useState(false);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    if (!token || !id) return;

    let mounted = true;
    let refreshTimer: number | undefined;

    getOrderDetail(id)
      .then((data) => {
        if (mounted) {
          setOrder(data);
        }

        const syncMarker = readPaymentSync();
        if (syncMarker && (syncMarker.orderId === id || syncMarker.orderId)) {
          refreshTimer = window.setTimeout(() => {
            getOrderDetail(id).then((fresh) => {
              if (mounted) {
                setOrder(fresh);
              }
            });
          }, 1200);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
      if (refreshTimer) {
        window.clearTimeout(refreshTimer);
      }
    };
  }, [id, token]);

  if (!token) {
    return (
      <div className="mx-auto w-full max-w-3xl rounded-2xl bg-white p-4 shadow-sm sm:p-6 lg:p-8">
        <h1 className="text-xl font-bold sm:text-2xl">Chi tiết đơn hàng</h1>
        <p className="mt-3 text-sm text-brand-gray sm:text-base">
          Bạn cần đăng nhập để xem chi tiết đơn.
        </p>
        <button
          onClick={() => navigate("/login")}
          className="mt-5 w-full rounded-xl bg-brand-dark px-5 py-3 font-semibold text-white sm:w-auto"
        >
          Đi tới đăng nhập
        </button>
      </div>
    );
  }

  if (loading) {
    return <OrderDetailSkeleton />;
  }
  if (!order) return <div>Không tìm thấy đơn hàng</div>;

  const canCancel = order.status === "PENDING" || order.status === "CONFIRMED";

  const handleCancelOrder = async () => {
    if (!id || !canCancel) return;

    const ok = await requestConfirm("Bạn chắc chắn muốn hủy đơn hàng này?");
    if (!ok) return;

    try {
      setCancelling(true);
      setActionMessage("");
      const updated = await cancelMyOrder(id);
      setOrder(updated);
      setActionMessage("Đã hủy đơn hàng thành công.");
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Không thể hủy đơn hàng lúc này.";
      setActionMessage(message);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 px-4 py-4 sm:space-y-6 sm:px-6 lg:px-8 lg:py-6">
      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs text-brand-gray sm:text-sm">Mã đơn</p>
            <h1 className="break-words text-xl font-bold sm:text-2xl">
              {order.orderCode || `#${order.id}`}
            </h1>
          </div>

          <div className="text-left md:text-right">
            <p className="text-xs text-brand-gray sm:text-sm">Trạng thái</p>
            <p className="font-semibold text-brand-dark sm:text-base">
              {getStatusText(order.status)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px] md:gap-6">
        <section className="space-y-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-bold sm:text-xl">Sản phẩm</h2>

            <div className="mt-4 space-y-3 sm:space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-3 border-b pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:gap-4"
                >
                  <img
                    src={item.imageUrl || getFallbackImageSrc("NovaGear")}
                    alt={item.productName || "Sản phẩm"}
                    className="h-16 w-16 rounded-xl object-cover sm:h-20 sm:w-20"
                    data-fallback={getFallbackImageSrc("NovaGear")}
                    onError={handleImageError}
                  />

                  <div className="min-w-0 flex-1">
                    <h3 className="break-words font-semibold text-sm sm:text-base">
                      {item.productName || "Sản phẩm"}
                    </h3>

                    {item.variantLabel && (
                      <p className="mt-1 text-xs text-brand-gray sm:text-sm">
                        Phiên bản: {item.variantLabel}
                      </p>
                    )}

                    {item.variantSku && (
                      <p className="mt-1 text-[11px] text-brand-gray sm:text-xs">
                        SKU: {item.variantSku}
                      </p>
                    )}

                    <p className="mt-1 text-xs text-brand-gray sm:text-sm">
                      Số lượng: {item.quantity}
                    </p>
                    <p className="mt-1 text-sm font-bold text-brand-red sm:text-base">
                      {formatCurrency(item.salePrice ?? item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-bold sm:text-xl">
              Thông tin nhận hàng
            </h2>
            <div className="mt-4 space-y-2 text-xs text-brand-gray sm:text-sm">
              <p>Người nhận: {order.receiverName || "Đang cập nhật"}</p>
              <p>Số điện thoại: {order.receiverPhone || "Đang cập nhật"}</p>
              <p>Địa chỉ: {order.shippingAddress || "Đang cập nhật"}</p>
              <p>Ghi chú: {order.note || "Không có"}</p>
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-2xl bg-white p-4 shadow-sm sm:p-5 md:sticky md:top-6">
          <h2 className="text-lg font-bold sm:text-xl">Thanh toán</h2>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs text-brand-gray sm:text-sm">
              Tổng cộng
            </span>
            <span className="text-lg font-extrabold text-brand-red sm:text-xl">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>

          {(order.status === "PENDING" || order.status === "CONFIRMED") && (
            <div className="mt-5 flex flex-col gap-3 sm:mt-6">
              {order.status === "PENDING" && (
                <Link
                  to={`/payment/${order.id}`}
                  className="block w-full rounded-xl bg-brand-yellow px-4 py-3 text-center text-sm font-semibold text-brand-dark transition-all hover:bg-yellow-300 active:scale-[0.98] sm:text-base"
                >
                  Thanh toán ngay
                </Link>
              )}

              {canCancel && (
                <button
                  onClick={handleCancelOrder}
                  disabled={cancelling}
                  className="w-full rounded-xl border border-red-300 px-4 py-3 text-center text-sm font-semibold text-red-600 transition-all hover:bg-red-50 disabled:opacity-60 sm:text-base"
                >
                  {cancelling ? "Đang hủy đơn..." : "Hủy đơn hàng"}
                </button>
              )}

              {actionMessage && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 sm:text-sm">
                  {actionMessage}
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function OrderDetailSkeleton() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 animate-pulse px-4 py-4 sm:space-y-6 sm:px-6 lg:px-8 lg:py-6">
      <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-slate-200" />
            <div className="h-7 w-40 rounded bg-slate-200 sm:h-8 sm:w-48" />
          </div>
          <div className="space-y-2 md:text-right">
            <div className="h-4 w-20 rounded bg-slate-200 md:ml-auto" />
            <div className="h-5 w-28 rounded bg-slate-200 md:ml-auto" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_320px] md:gap-6">
        <section className="space-y-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
            <div className="h-6 w-32 rounded bg-slate-200" />
            <div className="mt-4 space-y-3 sm:space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex flex-col gap-3 border-b pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:gap-4"
                >
                  <div className="h-16 w-16 rounded-xl bg-slate-200 sm:h-20 sm:w-20" />
                  <div className="flex-1 space-y-3">
                    <div className="h-4 w-3/5 rounded bg-slate-200" />
                    <div className="h-3 w-2/5 rounded bg-slate-200" />
                    <div className="h-3 w-1/4 rounded bg-slate-200" />
                    <div className="h-4 w-24 rounded bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 shadow-sm sm:p-5">
            <div className="h-6 w-40 rounded bg-slate-200" />
            <div className="mt-4 space-y-3">
              <div className="h-4 w-3/5 rounded bg-slate-200" />
              <div className="h-4 w-2/5 rounded bg-slate-200" />
              <div className="h-4 w-4/5 rounded bg-slate-200" />
              <div className="h-4 w-1/2 rounded bg-slate-200" />
            </div>
          </div>
        </section>

        <aside className="h-fit rounded-2xl bg-white p-4 shadow-sm sm:p-5">
          <div className="h-6 w-28 rounded bg-slate-200" />
          <div className="mt-4 flex items-center justify-between">
            <div className="h-4 w-20 rounded bg-slate-200" />
            <div className="h-6 w-24 rounded bg-slate-200" />
          </div>
          <div className="mt-6 space-y-3">
            <div className="h-11 w-full rounded-xl bg-slate-200" />
            <div className="h-11 w-full rounded-xl bg-slate-200" />
            <div className="h-16 w-full rounded-xl bg-slate-100" />
          </div>
        </aside>
      </div>
    </div>
  );
}
