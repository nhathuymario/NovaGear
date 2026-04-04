import axiosClient from "./axiosClient"

export interface InventoryItem {
    id: number | string
    productId?: number | string
    variantId?: number | string
    productName?: string
    sku?: string
    color?: string
    ram?: string
    storage?: string
    stockQuantity: number
    reservedQuantity: number
    availableQuantity: number
    updatedAt?: string
    status?: string
}

export interface InventoryTransaction {
    id: number | string
    inventoryId?: number | string
    productId?: number | string
    variantId?: number | string
    type?: string
    quantity: number
    note?: string
    createdAt?: string
    createdBy?: string
}

export interface InventoryListResult {
    items: InventoryItem[]
    totalElements: number
    totalPages: number
    page: number
    size: number
}

export interface StockImportPayload {
    variantId: number | string
    quantity: number
    note?: string
}

export interface StockAdjustmentPayload {
    variantId: number | string
    quantity: number
    note?: string
}

type RawInventoryItem = {
    id?: number | string
    productId?: number | string
    variantId?: number | string
    productName?: string
    sku?: string
    color?: string
    ram?: string
    storage?: string
    stockQuantity?: number
    reservedQuantity?: number
    availableQuantity?: number
    updatedAt?: string
    status?: string
}

type RawInventoryTransaction = {
    id?: number | string
    inventoryId?: number | string
    productId?: number | string
    variantId?: number | string
    type?: string
    quantity?: number
    note?: string
    createdAt?: string
    createdBy?: string
}

function mapInventoryItem(raw: RawInventoryItem): InventoryItem {
    return {
        id: raw.id ?? "",
        productId: raw.productId ?? "",
        variantId: raw.variantId ?? "",
        productName: raw.productName ?? "",
        sku: raw.sku ?? "",
        color: raw.color ?? "",
        ram: raw.ram ?? "",
        storage: raw.storage ?? "",
        stockQuantity: Number(raw.stockQuantity ?? 0),
        reservedQuantity: Number(raw.reservedQuantity ?? 0),
        availableQuantity: Number(raw.availableQuantity ?? 0),
        updatedAt: raw.updatedAt ?? "",
        status: raw.status ?? "",
    }
}

function mapInventoryTransaction(raw: RawInventoryTransaction): InventoryTransaction {
    return {
        id: raw.id ?? "",
        inventoryId: raw.inventoryId ?? "",
        productId: raw.productId ?? "",
        variantId: raw.variantId ?? "",
        type: raw.type ?? "",
        quantity: Number(raw.quantity ?? 0),
        note: raw.note ?? "",
        createdAt: raw.createdAt ?? "",
        createdBy: raw.createdBy ?? "",
    }
}

export async function getAllInventory(params?: {
    keyword?: string
    status?: string
    page?: number
    size?: number
}): Promise<InventoryListResult> {
    const query = new URLSearchParams()

    if (params?.keyword?.trim()) query.set("keyword", params.keyword.trim())
    if (params?.status?.trim()) query.set("status", params.status.trim())
    query.set("page", String(params?.page ?? 0))
    query.set("size", String(params?.size ?? 20))

    const res = await axiosClient.get(`/admin/inventory?${query.toString()}`)
    const data = res.data ?? {}

    return {
        items: Array.isArray(data.content) ? data.content.map(mapInventoryItem) : [],
        totalElements: Number(data.totalElements ?? 0),
        totalPages: Number(data.totalPages ?? 0),
        page: Number(data.number ?? params?.page ?? 0),
        size: Number(data.size ?? params?.size ?? 20),
    }
}

export async function getInventoryByVariant(variantId: number | string): Promise<InventoryItem> {
    const res = await axiosClient.get(`/admin/inventory/variant/${variantId}`)
    return mapInventoryItem(res.data)
}

export async function importStock(payload: StockImportPayload) {
    const res = await axiosClient.post("/admin/inventory/import", payload)
    return res.data?.data ? mapInventoryItem(res.data.data) : res.data
}

export async function adjustStock(payload: StockAdjustmentPayload) {
    const res = await axiosClient.put("/admin/inventory/adjust", payload)
    return res.data?.data ? mapInventoryItem(res.data.data) : res.data
}

export async function getInventoryTransactions(
    variantId: number | string
): Promise<InventoryTransaction[]> {
    const res = await axiosClient.get(`/admin/inventory/variant/${variantId}/transactions`)
    const items = Array.isArray(res.data) ? res.data : res.data?.content ?? []
    return items.map(mapInventoryTransaction)
}