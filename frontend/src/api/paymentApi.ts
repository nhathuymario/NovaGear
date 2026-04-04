import axiosClient from "./axiosClient"
import type { Payment } from "../types/payment"

type RawPayment = {
    id?: number | string
    orderId?: number | string
    method?: string
    amount?: number
    status?: string
    paymentUrl?: string
    transactionCode?: string
    createdAt?: string
}

function mapPayment(raw: RawPayment): Payment {
    return {
        id: raw.id ?? "",
        orderId: raw.orderId ?? "",
        method: raw.method ?? "",
        amount: Number(raw.amount ?? 0),
        status: (raw.status as Payment["status"]) ?? "PENDING",
        paymentUrl: raw.paymentUrl ?? "",
        transactionCode: raw.transactionCode ?? "",
        createdAt: raw.createdAt ?? "",
    }
}

export async function createPayment(orderId: number | string, method = "COD"): Promise<Payment> {
    const res = await axiosClient.post("/payments", { orderId, method })
    return mapPayment(res.data)
}

export async function getPaymentByOrderId(orderId: number | string): Promise<Payment | null> {
    const res = await axiosClient.get(`/payments/order/${orderId}`)
    if (!res.data) return null
    return mapPayment(res.data)
}

export async function mockPaymentSuccess(orderId: number | string) {
    const res = await axiosClient.post(`/payments/mock-success`, { orderId })
    return res.data
}

export async function mockPaymentFail(orderId: number | string) {
    const res = await axiosClient.post(`/payments/mock-fail`, { orderId })
    return res.data
}