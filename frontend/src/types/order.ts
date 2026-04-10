export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPING"
    | "DELIVERED"
    | "CANCELLED"

export interface CreateOrderPayload {
    customerName: string
    phone: string
    address: string
    note?: string
}

export interface OrderItem {
    id: number | string
    productId: number | string
    variantId?: number | string
    productName: string
    imageUrl?: string
    quantity: number
    price: number
    salePrice?: number
    variantSku?: string
    variantLabel?: string
}

export interface Order {
    id: number | string
    orderCode: string
    status: OrderStatus
    paymentStatus?: string
    totalAmount: number
    shippingAddress: string
    receiverName: string
    receiverPhone: string
    note?: string
    createdAt?: string
    items: OrderItem[]
}