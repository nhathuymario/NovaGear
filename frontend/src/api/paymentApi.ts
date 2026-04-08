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
    transactionRef?: string
    createdAt?: string
}

function normalizePaymentMethod(method?: string): string {
    const value = (method ?? "COD").trim().toUpperCase()
    if (value === "ONLINE") return "BANK_TRANSFER"
    if (value === "BANK_TRANSFER" || value === "E_WALLET" || value === "COD") {
        return value
    }
    return "COD"
}

function mapPayment(raw: RawPayment): Payment {
    return {
        id: raw.id ?? "",
        orderId: raw.orderId ?? "",
        method: raw.method ?? "",
        amount: Number(raw.amount ?? 0),
        status: (raw.status as Payment["status"]) ?? "PENDING",
        paymentUrl: raw.paymentUrl ?? "",
        transactionCode: raw.transactionCode ?? raw.transactionRef ?? "",
        createdAt: raw.createdAt ?? "",
    }
}

export async function createPayment(orderId: number | string, method = "COD"): Promise<Payment> {
    const res = await axiosClient.post("/payments", {
        orderId,
        method: normalizePaymentMethod(method),
    })
    return mapPayment(res.data)
}

export async function getMyPayments(): Promise<Payment[]> {
    const res = await axiosClient.get("/payments/me")
    const items = Array.isArray(res.data) ? res.data : []
    return items.map(mapPayment)
}

export async function getPaymentByOrderId(orderId: number | string): Promise<Payment | null> {
    const res = await axiosClient.get(`/payments/order/${orderId}`)
    if (!res.data) return null
    return mapPayment(res.data)
}

export async function mockPaymentCallback(
    orderId: number | string,
    status: "SUCCESS" | "FAILED" | "REFUNDED",
    note?: string
) {
    const query = new URLSearchParams({
        orderId: String(orderId),
        status,
    })

    if (note?.trim()) {
        query.set("note", note.trim())
    }

    const res = await axiosClient.get(`/payments/mock-callback?${query.toString()}`)
    return mapPayment(res.data)
}

export async function mockPaymentSuccess(orderId: number | string) {
    return mockPaymentCallback(orderId, "SUCCESS", "Mock success from FE")
}

export async function mockPaymentFail(orderId: number | string) {
    return mockPaymentCallback(orderId, "FAILED", "Mock failed from FE")
}