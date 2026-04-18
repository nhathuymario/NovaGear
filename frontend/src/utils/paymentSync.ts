const PAYMENT_SYNC_KEY = "novagear-payment-sync"

type PaymentSyncMarker = {
    orderId: string
    status: string
    updatedAt: number
}

export function markPaymentSync(orderId: string, status: string) {
    if (typeof globalThis.window === "undefined") return

    const marker: PaymentSyncMarker = {
        orderId,
        status,
        updatedAt: Date.now(),
    }

    globalThis.window.localStorage.setItem(PAYMENT_SYNC_KEY, JSON.stringify(marker))
}

export function readPaymentSync(): PaymentSyncMarker | null {
    if (typeof globalThis.window === "undefined") return null

    const raw = globalThis.window.localStorage.getItem(PAYMENT_SYNC_KEY)
    if (!raw) return null

    try {
        const parsed = JSON.parse(raw) as PaymentSyncMarker
        if (!parsed?.orderId || !parsed?.status || !parsed?.updatedAt) {
            return null
        }
        return parsed
    } catch {
        return null
    }
}


