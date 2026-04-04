import axiosClient from "./axiosClient"
import type { CreateOrderPayload, Order } from "../types/order"

type RawOrderItem = {
    id?: number | string
    productId?: number | string
    productName?: string
    quantity?: number
    price?: number
    salePrice?: number
    imageUrl?: string
}

type RawOrder = {
    id?: number | string
    orderCode?: string
    status?: string
    totalAmount?: number
    shippingAddress?: string
    receiverName?: string
    receiverPhone?: string
    note?: string
    createdAt?: string
    items?: RawOrderItem[]
}

function mapOrder(raw: RawOrder): Order {
    return {
        id: raw.id ?? "",
        orderCode: raw.orderCode ?? "",
        status: (raw.status as Order["status"]) ?? "PENDING",
        totalAmount: Number(raw.totalAmount ?? 0),
        shippingAddress: raw.shippingAddress ?? "",
        receiverName: raw.receiverName ?? "",
        receiverPhone: raw.receiverPhone ?? "",
        note: raw.note ?? "",
        createdAt: raw.createdAt ?? "",
        items: (raw.items ?? []).map((item) => ({
            id: item.id ?? "",
            productId: item.productId ?? "",
            productName: item.productName ?? "",
            imageUrl: item.imageUrl ?? "",
            quantity: Number(item.quantity ?? 0),
            price: Number(item.price ?? 0),
            salePrice:
                item.salePrice != null ? Number(item.salePrice) : undefined,
        })),
    }
}

export async function createOrderFromCart(payload: CreateOrderPayload): Promise<Order> {
    const res = await axiosClient.post("/orders", payload)
    return mapOrder(res.data)
}

export async function getMyOrders(): Promise<Order[]> {
    const res = await axiosClient.get("/orders")
    const items = Array.isArray(res.data) ? res.data : res.data?.content ?? []
    return items.map(mapOrder)
}

export async function getOrderDetail(orderId: number | string): Promise<Order> {
    const res = await axiosClient.get(`/orders/${orderId}`)
    return mapOrder(res.data)
}

export async function cancelOrder(orderId: number | string) {
    const res = await axiosClient.put(`/orders/${orderId}/cancel`)
    return res.data
}