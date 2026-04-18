export type SavedAddress = {
    id: string
    label: string
    receiverName: string
    receiverPhone: string
    shippingAddress: string
    note: string
    isDefault?: boolean
    updatedAt: string
}

export type SavedAddressDraft = {
    label?: string
    receiverName: string
    receiverPhone: string
    shippingAddress: string
    note?: string
}

const DEFAULT_ADDRESS_LABEL = "Dia chi giao hang"

export function normalizePhone(value: string) {
    return value.trim().split(/\s+/).join("")
}

export function buildAddressStorageKey(userKey: string) {
    return `novagear_saved_addresses_${userKey}`
}

export function loadSavedAddresses(userKey: string): SavedAddress[] {
    try {
        const raw = localStorage.getItem(buildAddressStorageKey(userKey))
        if (!raw) return []

        const parsed = JSON.parse(raw) as SavedAddress[]
        if (!Array.isArray(parsed)) return []

        return parsed.filter((item) => Boolean(item?.id && item?.shippingAddress))
    } catch {
        return []
    }
}

export function persistSavedAddresses(userKey: string, addresses: SavedAddress[]) {
    localStorage.setItem(buildAddressStorageKey(userKey), JSON.stringify(addresses))
}

export function createSavedAddress(draft: SavedAddressDraft): SavedAddress {
    const generatedId =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `${Date.now()}`

    return {
        id: generatedId,
        label: draft.label?.trim() || DEFAULT_ADDRESS_LABEL,
        receiverName: draft.receiverName.trim(),
        receiverPhone: normalizePhone(draft.receiverPhone),
        shippingAddress: draft.shippingAddress.trim(),
        note: draft.note?.trim() || "",
        isDefault: true,
        updatedAt: new Date().toISOString(),
    }
}


