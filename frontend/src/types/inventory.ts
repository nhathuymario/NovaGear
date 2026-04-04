export interface InventoryItem {
    id: number | string
    productId: number | string
    variantId?: number | string
    productName: string
    sku?: string
    color?: string
    ram?: string
    storage?: string
    stockQuantity: number
    reservedQuantity?: number
    availableQuantity?: number
    updatedAt?: string
}

export interface InventoryTransaction {
    id: number | string
    inventoryId?: number | string
    productId?: number | string
    variantId?: number | string
    type: string
    quantity: number
    note?: string
    createdAt?: string
    createdBy?: string
}

export interface StockAdjustmentPayload {
    productId: number | string
    variantId?: number | string
    quantity: number
    note?: string
}

export interface StockImportPayload {
    productId: number | string
    variantId?: number | string
    quantity: number
    note?: string
}