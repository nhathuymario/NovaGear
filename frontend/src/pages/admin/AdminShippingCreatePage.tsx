import { useState } from "react"
import { createAdminShipment } from "../../api/shippingApi"
import type { CreateShipmentRequest } from "../../types/shipping"

export default function AdminShippingCreatePage() {
    const [form, setForm] = useState<CreateShipmentRequest>({
        orderId: "",
        userId: "",
        orderCode: "",
        receiverName: "",
        receiverPhone: "",
        shippingAddress: "",
        note: "",
        carrierName: "",
        trackingNumber: "",
        shippingMethod: "",
        shippingFee: 0,
        estimatedDeliveryAt: "",
        status: "READY_TO_SHIP",
    })
    const [saving, setSaving] = useState(false)

    const handleChange = (key: keyof CreateShipmentRequest, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            setSaving(true)
            const created = await createAdminShipment(form)
            alert("Tạo vận chuyển thành công: " + (created.id ?? created.orderCode))
            // redirect to detail page
            window.location.href = `/admin/shipping/${created.id}`
        } catch (error) {
            console.error("Failed to create shipment:", error)
            alert("Tạo vận chuyển thất bại")
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Tạo vận chuyển mới</h1>
                    <p className="mt-1 text-sm text-slate-500">Tạo shipment cho đơn hàng chưa có vận chuyển</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label className="block text-xs font-medium text-slate-700">Order ID</label>
                        <input value={form.orderId} onChange={(e) => handleChange("orderId", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700">Order Code</label>
                        <input value={form.orderCode} onChange={(e) => handleChange("orderCode", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700">User ID</label>
                        <input value={form.userId} onChange={(e) => handleChange("userId", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700">Receiver Name</label>
                        <input value={form.receiverName} onChange={(e) => handleChange("receiverName", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700">Receiver Phone</label>
                        <input value={form.receiverPhone} onChange={(e) => handleChange("receiverPhone", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700">Shipping Fee</label>
                        <input type="number" value={form.shippingFee} onChange={(e) => handleChange("shippingFee", Number(e.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-700">Shipping Address</label>
                    <textarea value={form.shippingAddress} onChange={(e) => handleChange("shippingAddress", e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label className="block text-xs font-medium text-slate-700">Carrier</label>
                        <input value={form.carrierName} onChange={(e) => handleChange("carrierName", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700">Tracking Number</label>
                        <input value={form.trackingNumber} onChange={(e) => handleChange("trackingNumber", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                        <label className="block text-xs font-medium text-slate-700">Estimated Delivery</label>
                        <input type="datetime-local" value={form.estimatedDeliveryAt} onChange={(e) => handleChange("estimatedDeliveryAt", e.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-slate-700">Status</label>
                        <select value={form.status} onChange={(e) => handleChange("status", e.target.value as any)} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm">
                            <option value="READY_TO_SHIP">Chờ gửi</option>
                            <option value="SHIPPED">Đã gửi</option>
                            <option value="IN_TRANSIT">Vận chuyển</option>
                            <option value="OUT_FOR_DELIVERY">Đang giao</option>
                            <option value="DELIVERED">Đã giao</option>
                            <option value="RETURNED">Hoàn trả</option>
                            <option value="CANCELLED">Hủy</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-slate-700">Note</label>
                    <textarea value={form.note} onChange={(e) => handleChange("note", e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm" />
                </div>

                <div className="flex gap-2 pt-2">
                    <button type="submit" disabled={saving} className="flex-1 rounded-lg bg-admin-accent px-4 py-2 text-sm font-medium text-white hover:bg-admin-accent/90 disabled:opacity-60">{saving ? "Đang tạo..." : "Tạo"}</button>
                    <a href="/admin/shipping/list" className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Hủy</a>
                </div>
            </form>
        </div>
    )
}

