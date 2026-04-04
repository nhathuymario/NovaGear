export type PaymentStatus =
    | "PENDING"
    | "SUCCESS"
    | "FAILED"
    | "CANCELLED"

export interface Payment {
    id: number | string
    orderId: number | string
    method?: string
    amount: number
    status: PaymentStatus
    paymentUrl?: string
    transactionCode?: string
    createdAt?: string
}