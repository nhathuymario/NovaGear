import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getAdminShipmentById, updateShipmentStatus, assignCarrier } from "../../api/shippingApi"
import type { Shipment, ShipmentStatus, UpdateShipmentStatusRequest, AssignCarrierRequest } from "../../types/shipping"
import ShipmentStatusTimeline from "./ShipmentStatusTimeline"

export default function ShipmentDetail() {
    const { shipmentId } = useParams<{ shipmentId: string }>()
    const navigate = useNavigate()
    const [shipment, setShipment] = useState<Shipment | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [editingCarrier, setEditingCarrier] = useState(false)
    const [editingStatus, setEditingStatus] = useState(false)

    const [carrierForm, setCarrierForm] = useState({
        carrierName: "",
        trackingNumber: "",
        shippingMethod: "",
        shippingFee: 0,
        estimatedDeliveryAt: "",
        note: "",
    })

    const [statusForm, setStatusForm] = useState({
        status: "READY_TO_SHIP" as ShipmentStatus,
        note: "",
    })

    const loadShipment = async () => {
        if (!shipmentId) return
        try {
            setLoading(true)
            const data = await getAdminShipmentById(shipmentId)
            setShipment(data)
            setCarrierForm({
                carrierName: data.carrierName || "",
                trackingNumber: data.trackingNumber || "",
                shippingMethod: data.shippingMethod || "",
                shippingFee: data.shippingFee || 0,
                estimatedDeliveryAt: data.estimatedDeliveryAt || "",
                note: data.statusNote || "",
            })
            setStatusForm({
                status: data.status,
                note: "",
            })
        } catch (error) {
            console.error("Failed to load shipment:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadShipment()
    }, [shipmentId])

    const handleUpdateCarrier = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!shipment) return
        try {
            setUpdating(true)
            const request: AssignCarrierRequest = {
                carrierName: carrierForm.carrierName,
                trackingNumber: carrierForm.trackingNumber,
                shippingMethod: carrierForm.shippingMethod,
                shippingFee: carrierForm.shippingFee,
                estimatedDeliveryAt: carrierForm.estimatedDeliveryAt,
                note: carrierForm.note,
            }
            const updated = await assignCarrier(shipment.id, request)
            setShipment(updated)
            setEditingCarrier(false)
            alert("Cập nhật carrier thành công")
        } catch (error) {
            console.error("Failed to update carrier:", error)
            alert("Cập nhật carrier thất bại")
        } finally {
            setUpdating(false)
        }
    }

    const handleUpdateStatus = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!shipment) return
        try {
            setUpdating(true)
            const request: UpdateShipmentStatusRequest = {
                status: statusForm.status,
                note: statusForm.note,
            }
            const updated = await updateShipmentStatus(shipment.id, request)
            setShipment(updated)
            setEditingStatus(false)
            setStatusForm({
                status: updated.status,
                note: "",
            })
            alert("Cập nhật trạng thái thành công")
        } catch (error) {
            console.error("Failed to update status:", error)
            alert("Cập nhật trạng thái thất bại")
        } finally {
            setUpdating(false)
        }
    }

    if (loading) {
        return (
            <div className="flex h-[40vh] items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-accent border-t-transparent" />
            </div>
        )
    }

    if (!shipment) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
                Vận chuyển không tìm thấy
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">
                        Chi tiết vận chuyển
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Mã đơn: {shipment.orderCode}
                    </p>
                </div>
                <button
                    onClick={() => navigate("/admin/shipping/list")}
                    className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                    ← Quay lại
                </button>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Info */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Thông tin đơn hàng
                        </h3>
                        <div className="mt-4 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Mã đơn:</span>
                                <span className="font-medium">{shipment.orderCode}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Order ID:</span>
                                <span className="font-medium">#{shipment.orderId}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600">Ngày tạo:</span>
                                <span className="font-medium">
                                    {new Date(shipment.createdAt).toLocaleString("vi-VN")}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Receiver Info */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Thông tin người nhận
                        </h3>
                        <div className="mt-4 space-y-3">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                                    Tên người nhận
                                </p>
                                <p className="mt-1 font-medium">{shipment.receiverName}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                                    Số điện thoại
                                </p>
                                <p className="mt-1 font-medium">{shipment.receiverPhone}</p>
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                                    Địa chỉ giao
                                </p>
                                <p className="mt-1 text-sm">{shipment.shippingAddress}</p>
                            </div>
                            {shipment.note && (
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                                        Ghi chú
                                    </p>
                                    <p className="mt-1 text-sm">{shipment.note}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Carrier Info */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">
                                Thông tin vận chuyển
                            </h3>
                            {!editingCarrier && (
                                <button
                                    onClick={() => setEditingCarrier(true)}
                                    className="text-sm text-admin-accent hover:underline"
                                >
                                    Chỉnh sửa
                                </button>
                            )}
                        </div>

                        {editingCarrier ? (
                            <form onSubmit={handleUpdateCarrier} className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Hãng vận chuyển
                                    </label>
                                    <input
                                        type="text"
                                        value={carrierForm.carrierName}
                                        onChange={(e) =>
                                            setCarrierForm({
                                                ...carrierForm,
                                                carrierName: e.target.value,
                                            })
                                        }
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-admin-accent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Tracking Number
                                    </label>
                                    <input
                                        type="text"
                                        value={carrierForm.trackingNumber}
                                        onChange={(e) =>
                                            setCarrierForm({
                                                ...carrierForm,
                                                trackingNumber: e.target.value,
                                            })
                                        }
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-admin-accent"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700">
                                            Phương thức giao
                                        </label>
                                        <input
                                            type="text"
                                            value={carrierForm.shippingMethod}
                                            onChange={(e) =>
                                                setCarrierForm({
                                                    ...carrierForm,
                                                    shippingMethod: e.target.value,
                                                })
                                            }
                                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-admin-accent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-700">
                                            Phí vận chuyển
                                        </label>
                                        <input
                                            type="number"
                                            value={carrierForm.shippingFee}
                                            onChange={(e) =>
                                                setCarrierForm({
                                                    ...carrierForm,
                                                    shippingFee: Number(e.target.value),
                                                })
                                            }
                                            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-admin-accent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Dự kiến giao
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={carrierForm.estimatedDeliveryAt}
                                        onChange={(e) =>
                                            setCarrierForm({
                                                ...carrierForm,
                                                estimatedDeliveryAt: e.target.value,
                                            })
                                        }
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-admin-accent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Ghi chú
                                    </label>
                                    <textarea
                                        value={carrierForm.note}
                                        onChange={(e) =>
                                            setCarrierForm({
                                                ...carrierForm,
                                                note: e.target.value,
                                            })
                                        }
                                        rows={3}
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-admin-accent"
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="flex-1 rounded-lg bg-admin-accent px-4 py-2 text-sm font-medium text-white hover:bg-admin-accent/90 disabled:opacity-60"
                                    >
                                        {updating ? "Đang lưu..." : "Lưu"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingCarrier(false)}
                                        className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="mt-4 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Hãng vận chuyển:</span>
                                    <span className="font-medium">
                                        {shipment.carrierName || "-"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Tracking Number:</span>
                                    <span className="font-medium">
                                        {shipment.trackingNumber || "-"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Phương thức:</span>
                                    <span className="font-medium">
                                        {shipment.shippingMethod || "-"}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Phí:</span>
                                    <span className="font-medium">
                                        {Number(shipment.shippingFee).toLocaleString("vi-VN")}đ
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-600">Dự kiến giao:</span>
                                    <span className="font-medium">
                                        {shipment.estimatedDeliveryAt
                                            ? new Date(
                                                shipment.estimatedDeliveryAt
                                            ).toLocaleString("vi-VN")
                                            : "-"}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Timeline */}
                    <ShipmentStatusTimeline shipment={shipment} />
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status Update */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-900">
                                Trạng thái
                            </h3>
                            {!editingStatus && (
                                <button
                                    onClick={() => setEditingStatus(true)}
                                    className="text-sm text-admin-accent hover:underline"
                                >
                                    Thay đổi
                                </button>
                            )}
                        </div>

                        {editingStatus ? (
                            <form onSubmit={handleUpdateStatus} className="mt-4 space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Trạng thái mới
                                    </label>
                                    <select
                                        value={statusForm.status}
                                        onChange={(e) =>
                                            setStatusForm({
                                                ...statusForm,
                                                status: e.target.value as ShipmentStatus,
                                            })
                                        }
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-admin-accent"
                                    >
                                        <option value="READY_TO_SHIP">Chờ gửi</option>
                                        <option value="SHIPPED">Đã gửi</option>
                                        <option value="IN_TRANSIT">Vận chuyển</option>
                                        <option value="OUT_FOR_DELIVERY">Đang giao</option>
                                        <option value="DELIVERED">Đã giao</option>
                                        <option value="RETURNED">Hoàn trả</option>
                                        <option value="CANCELLED">Hủy</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700">
                                        Ghi chú
                                    </label>
                                    <textarea
                                        value={statusForm.note}
                                        onChange={(e) =>
                                            setStatusForm({
                                                ...statusForm,
                                                note: e.target.value,
                                            })
                                        }
                                        rows={3}
                                        placeholder="Nhập ghi chú cho trạng thái này..."
                                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-admin-accent"
                                    />
                                </div>
                                <div className="flex gap-2 pt-2">
                                    <button
                                        type="submit"
                                        disabled={updating}
                                        className="flex-1 rounded-lg bg-admin-accent px-4 py-2 text-sm font-medium text-white hover:bg-admin-accent/90 disabled:opacity-60"
                                    >
                                        {updating ? "Đang lưu..." : "Cập nhật"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingStatus(false)}
                                        className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                                    >
                                        Hủy
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="mt-4">
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                                    Trạng thái hiện tại
                                </p>
                                <p className="mt-2 text-lg font-semibold text-admin-accent">
                                    {shipment.status}
                                </p>
                                {shipment.statusNote && (
                                    <p className="mt-2 text-sm text-slate-600">
                                        {shipment.statusNote}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Key Dates */}
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-slate-900">
                            Các mốc thời gian
                        </h3>
                        <div className="mt-4 space-y-3">
                            <div>
                                <p className="text-xs text-slate-600">Tạo:</p>
                                <p className="font-medium">
                                    {new Date(shipment.createdAt).toLocaleString("vi-VN")}
                                </p>
                            </div>
                            {shipment.shippedAt && (
                                <div>
                                    <p className="text-xs text-slate-600">Gửi:</p>
                                    <p className="font-medium">
                                        {new Date(shipment.shippedAt).toLocaleString("vi-VN")}
                                    </p>
                                </div>
                            )}
                            {shipment.deliveredAt && (
                                <div>
                                    <p className="text-xs text-slate-600">Giao:</p>
                                    <p className="font-medium">
                                        {new Date(shipment.deliveredAt).toLocaleString("vi-VN")}
                                    </p>
                                </div>
                            )}
                            {shipment.estimatedDeliveryAt && (
                                <div>
                                    <p className="text-xs text-slate-600">Dự kiến:</p>
                                    <p className="font-medium">
                                        {new Date(shipment.estimatedDeliveryAt).toLocaleString(
                                            "vi-VN"
                                        )}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

