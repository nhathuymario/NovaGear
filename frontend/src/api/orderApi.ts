import axiosClient from "./axiosClient"
import type { CreateOrderPayload, Order } from "../types/order"

type RawVariantSummary = {
    id?: number | string
    sku?: string
    color?: string
    ram?: string
    storage?: string
    versionName?: string
}

type RawOrderItem = {
    id?: number | string
    productId?: number | string
    variantId?: number | string
    productName?: string
    quantity?: number
    price?: number
    salePrice?: number
    imageUrl?: string
    sku?: string
    color?: string
    ram?: string
    storage?: string
    versionName?: string
    variant?: RawVariantSummary
    productVariant?: RawVariantSummary
    variantLabel?: string
    variantSku?: string
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

type RawCheckoutResponse = {
    id?: number | string
    orderId?: number | string
    orderCode?: string
    status?: string
    totalAmount?: number
    paymentUrl?: string
    order?: RawOrder
    data?: {
        order?: RawOrder
        orderId?: number | string
        id?: number | string
        orderCode?: string
        status?: string
        totalAmount?: number
    }
}

function buildVariantLabel(source?: RawVariantSummary | RawOrderItem): string {
    return [
        source?.color,
        source?.ram,
        source?.storage,
        source?.versionName,
    ]
        .filter(Boolean)
        .join(" / ")
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
        items: (raw.items ?? []).map((item) => {
            const variantSource = item.variant ?? item.productVariant ?? item

            return {
                id: item.id ?? "",
                productId: item.productId ?? "",
                variantId:
                    item.variantId ??
                    item.variant?.id ??
                    item.productVariant?.id ??
                    "",
                productName: item.productName ?? "",
                imageUrl: item.imageUrl ?? "",
                quantity: Number(item.quantity ?? 0),
                price: Number(item.price ?? 0),
                salePrice:
                    item.salePrice != null ? Number(item.salePrice) : undefined,
                variantSku:
                    item.variantSku ??
                    item.variant?.sku ??
                    item.productVariant?.sku ??
                    item.sku ??
                    "",
                variantLabel:
                    item.variantLabel ??
                    buildVariantLabel(variantSource) ??
                    "",
            }
        }),
    }
}

function mapCheckoutResponse(raw: RawCheckoutResponse): Order {
    if (raw?.order) {
        return mapOrder(raw.order)
    }

    if (raw?.data?.order) {
        return mapOrder(raw.data.order)
    }

    return {
        id: raw.orderId ?? raw.id ?? raw?.data?.orderId ?? raw?.data?.id ?? "",
        orderCode: raw.orderCode ?? raw?.data?.orderCode ?? "",
        status: (raw.status as Order["status"]) ?? (raw?.data?.status as Order["status"]) ?? "PENDING",
        totalAmount: Number(raw.totalAmount ?? raw?.data?.totalAmount ?? 0),
        shippingAddress: "",
        receiverName: "",
        receiverPhone: "",
        note: "",
        createdAt: "",
        items: [],
    }
}

export async function createOrderFromCart(payload: CreateOrderPayload): Promise<Order> {
    const res = await axiosClient.post("/orders/checkout", payload)
    return mapCheckoutResponse(res.data)
}

export async function getMyOrders(): Promise<Order[]> {
    const res = await axiosClient.get("/orders/my")
    const items = Array.isArray(res.data) ? res.data : res.data?.content ?? []
    return items.map(mapOrder)
}

export async function getOrderDetail(orderId: number | string): Promise<Order> {
    const res = await axiosClient.get(`/orders/${orderId}`)
    return mapOrder(res.data)
}