import axiosClient from "./axiosClient"
import type {
    Shipment,
    CreateShipmentRequest,
    AssignCarrierRequest,
    UpdateShipmentStatusRequest,
} from "../types/shipping"

type RawShipment = {
    id?: number | string
    orderId?: number | string
    userId?: number | string
    orderCode?: string
    receiverName?: string
    receiverPhone?: string
    shippingAddress?: string
    note?: string
    carrierName?: string
    trackingNumber?: string
    shippingMethod?: string
    shippingFee?: number | string
    estimatedDeliveryAt?: string
    status?: string
    statusNote?: string
    createdAt?: string
    updatedAt?: string
    shippedAt?: string
    deliveredAt?: string
    events?: Array<{
        id?: number | string
        fromStatus?: string
        toStatus?: string
        note?: string
        changedBy?: string
        createdAt?: string
    }>
}

function mapShipment(raw: RawShipment): Shipment {
    return {
        id: raw.id ?? "",
        orderId: raw.orderId ?? "",
        userId: raw.userId ?? "",
        orderCode: raw.orderCode ?? "",
        receiverName: raw.receiverName ?? "",
        receiverPhone: raw.receiverPhone ?? "",
        shippingAddress: raw.shippingAddress ?? "",
        note: raw.note ?? "",
        carrierName: raw.carrierName ?? "",
        trackingNumber: raw.trackingNumber ?? "",
        shippingMethod: raw.shippingMethod ?? "",
        shippingFee: Number(raw.shippingFee ?? 0),
        estimatedDeliveryAt: raw.estimatedDeliveryAt ?? "",
        status: (raw.status ?? "READY_TO_SHIP") as Shipment["status"],
        statusNote: raw.statusNote ?? "",
        createdAt: raw.createdAt ?? "",
        updatedAt: raw.updatedAt ?? "",
        shippedAt: raw.shippedAt,
        deliveredAt: raw.deliveredAt,
        events: (raw.events ?? []).map((e) => ({
            id: e.id ?? "",
            fromStatus: (e.fromStatus ?? "READY_TO_SHIP") as any,
            toStatus: (e.toStatus ?? "READY_TO_SHIP") as any,
            note: e.note ?? "",
            changedBy: e.changedBy ?? "",
            createdAt: e.createdAt ?? "",
        })),
    }
}

// Admin/Staff endpoints
export async function getAdminShipments(): Promise<Shipment[]> {
    const res = await axiosClient.get("/admin/shipments")
    const items = Array.isArray(res.data) ? res.data : res.data?.content ?? []
    return items.map(mapShipment)
}

export async function getAdminShipmentById(shipmentId: number | string): Promise<Shipment> {
    const res = await axiosClient.get(`/admin/shipments/${shipmentId}`)
    return mapShipment(res.data)
}

export async function createAdminShipment(request: CreateShipmentRequest): Promise<Shipment> {
    const res = await axiosClient.post("/admin/shipments", request)
    return mapShipment(res.data)
}

export async function assignCarrier(
    shipmentId: number | string,
    request: AssignCarrierRequest
): Promise<Shipment> {
    const res = await axiosClient.put(`/admin/shipments/${shipmentId}/carrier`, request)
    return mapShipment(res.data)
}

export async function updateShipmentStatus(
    shipmentId: number | string,
    request: UpdateShipmentStatusRequest
): Promise<Shipment> {
    const res = await axiosClient.put(`/admin/shipments/${shipmentId}/status`, request)
    return mapShipment(res.data)
}

// Customer endpoints
export async function getMyShipments(userId: number | string): Promise<Shipment[]> {
    const res = await axiosClient.get("/shipments/my", {
        headers: { "X-User-Id": userId },
    })
    const items = Array.isArray(res.data) ? res.data : res.data?.content ?? []
    return items.map(mapShipment)
}

export async function getMyShipment(
    userId: number | string,
    shipmentId: number | string
): Promise<Shipment> {
    const res = await axiosClient.get(`/shipments/${shipmentId}`, {
        headers: { "X-User-Id": userId },
    })
    return mapShipment(res.data)
}

export async function getMyShipmentByOrderId(
    userId: number | string,
    orderId: number | string
): Promise<Shipment> {
    const res = await axiosClient.get(`/shipments/order/${orderId}`, {
        headers: { "X-User-Id": userId },
    })
    return mapShipment(res.data)
}

