import axiosClient from "./axiosClient"
import type {
    InventoryItem,
    InventoryTransaction,
    StockAdjustmentPayload,
    StockImportPayload,
} from "../types/inventory"

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

export async function getAllInventory(): Promise<InventoryItem[]> {
    const res = await axiosClient.get("/inventory")
    const items = Array.isArray(res.data) ? res.data : res.data?.content ?? []
    return items.map(mapInventoryItem)
}

export async function getInventoryByProduct(productId: number | string): Promise<InventoryItem[]> {
    const res = await axiosClient.get(`/inventory/product/${productId}`)
    const items = Array.isArray(res.data) ? res.data : res.data?.content ?? []
    return items.map(mapInventoryItem)
}

export async function importStock(payload: StockImportPayload) {
    const res = await axiosClient.post("/admin/inventory/import", payload)
    return res.data
}

export async function adjustStock(payload: StockAdjustmentPayload) {
    const res = await axiosClient.post("/admin/inventory/adjust", payload)
    return res.data
}

export async function getInventoryTransactions(
    productId?: number | string
): Promise<InventoryTransaction[]> {
    const url = productId
        ? `/admin/inventory/transactions?productId=${productId}`
        : "/admin/inventory/transactions"

    const res = await axiosClient.get(url)
    const items = Array.isArray(res.data) ? res.data : res.data?.content ?? []
    return items.map(mapInventoryTransaction)
}