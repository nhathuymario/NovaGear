export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPING"
    | "DELIVERED"
    | "CANCELLED"

export interface OrderItem {
    id: number | string
    productId: number | string
    productName: string
    imageUrl?: string
    quantity: number
    price: number
    salePrice?: number
}

export interface Order {
    id: number | string
    orderCode?: string
    status: OrderStatus
    totalAmount: number
    shippingAddress?: string
    receiverName?: string
    receiverPhone?: string
    note?: string
    createdAt?: string
    items: OrderItem[]
}

export interface CreateOrderPayload {
    receiverName: string
    receiverPhone: string
    shippingAddress: string
    note?: string
}