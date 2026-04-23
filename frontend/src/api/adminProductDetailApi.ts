import axiosClient from "./axiosClient"

export interface AdminVariantPayload {
    sku: string
    color?: string
    ram?: string
    storage?: string
    versionName?: string
    price: number
    salePrice?: number
    stockQuantity: number
    imageUrl?: string
    status?: "ACTIVE" | "OUT_OF_STOCK" | "INACTIVE"
}

export interface AdminSpecificationPayload {
    groupName: string
    specKey: string
    specValue: string
    sortOrder?: number
}

export interface AdminProductImagePayload {
    imageUrl: string
    thumbnail?: boolean
    sortOrder?: number
}

export interface AdminVariantItem {
    id: number | string
    sku: string
    color?: string
    ram?: string
    storage?: string
    versionName?: string
    price: number
    salePrice?: number
    stockQuantity?: number
    imageUrl?: string
    status?: string
}

export interface AdminSpecificationItem {
    id: number | string
    groupName: string
    specKey: string
    specValue: string
    sortOrder?: number
}

export interface AdminProductImageItem {
    id: number | string
    imageUrl: string
    thumbnail: boolean
    sortOrder: number
}

type RawVariant = {
    id?: number | string
    sku?: string
    color?: string
    ram?: string
    storage?: string
    versionName?: string
    price?: number
    salePrice?: number
    stockQuantity?: number
    imageUrl?: string
    status?: string
}

type RawSpecification = {
    id?: number | string
    groupName?: string
    specKey?: string
    specValue?: string
    sortOrder?: number
}

type RawProductImage = {
    id?: number | string
    imageUrl?: string
    thumbnail?: boolean
    sortOrder?: number
}

function unwrapApiData<T>(data: unknown): T {
    const wrapped = data as { data?: T }
    return (wrapped?.data ?? data) as T
}

function normalizeOptionalText(value?: string) {
    const text = (value ?? "").trim()
    return text.length > 0 ? text : undefined
}

function normalizeVariantPayload(payload: AdminVariantPayload): AdminVariantPayload {
    const price = Number(payload.price)
    const stockQuantity = Number(payload.stockQuantity)
    const salePrice = payload.salePrice != null ? Number(payload.salePrice) : undefined

    return {
        sku: payload.sku.trim(),
        color: normalizeOptionalText(payload.color),
        ram: normalizeOptionalText(payload.ram),
        storage: normalizeOptionalText(payload.storage),
        versionName: normalizeOptionalText(payload.versionName),
        price: Number.isFinite(price) ? price : 0,
        salePrice: salePrice != null && Number.isFinite(salePrice) ? salePrice : undefined,
        stockQuantity: Number.isFinite(stockQuantity) ? Math.max(0, Math.floor(stockQuantity)) : 0,
        imageUrl: normalizeOptionalText(payload.imageUrl),
        status: payload.status,
    }
}

function mapVariant(raw: RawVariant): AdminVariantItem {
    return {
        id: raw.id ?? "",
        sku: raw.sku ?? "",
        color: raw.color ?? "",
        ram: raw.ram ?? "",
        storage: raw.storage ?? "",
        versionName: raw.versionName ?? "",
        price: Number(raw.price ?? 0),
        salePrice: raw.salePrice != null ? Number(raw.salePrice) : undefined,
        stockQuantity: raw.stockQuantity != null ? Number(raw.stockQuantity) : 0,
        imageUrl: raw.imageUrl ?? "",
        status: raw.status ?? "",
    }
}

function mapSpecification(raw: RawSpecification): AdminSpecificationItem {
    return {
        id: raw.id ?? "",
        groupName: raw.groupName ?? "",
        specKey: raw.specKey ?? "",
        specValue: raw.specValue ?? "",
        sortOrder: raw.sortOrder != null ? Number(raw.sortOrder) : 0,
    }
}

function mapProductImage(raw: RawProductImage): AdminProductImageItem {
    return {
        id: raw.id ?? "",
        imageUrl: raw.imageUrl ?? "",
        thumbnail: Boolean(raw.thumbnail),
        sortOrder: Number(raw.sortOrder ?? 0),
    }
}

export async function getProductVariants(productId: number | string): Promise<AdminVariantItem[]> {
    const res = await axiosClient.get(`/admin/products/${productId}`)
    return (res.data?.variants ?? []).map(mapVariant)
}

export async function getProductSpecifications(
    productId: number | string
): Promise<AdminSpecificationItem[]> {
    const res = await axiosClient.get(`/admin/products/${productId}`)
    return (res.data?.specifications ?? []).map(mapSpecification)
}

export async function getProductImages(productId: number | string): Promise<AdminProductImageItem[]> {
    const res = await axiosClient.get(`/admin/products/${productId}`)
    return (res.data?.images ?? []).map(mapProductImage)
}

export async function addProductVariant(
    productId: number | string,
    payload: AdminVariantPayload
) {
    const res = await axiosClient.post(
        `/admin/products/${productId}/variants`,
        normalizeVariantPayload(payload)
    )
    return unwrapApiData<AdminVariantItem>(res.data)
}

export async function updateProductVariant(
    variantId: number | string,
    payload: AdminVariantPayload
) {
    const res = await axiosClient.put(
        `/admin/products/variants/${variantId}`,
        normalizeVariantPayload(payload)
    )
    return unwrapApiData<AdminVariantItem>(res.data)
}

export async function deleteProductVariant(variantId: number | string) {
    const res = await axiosClient.delete(`/admin/products/variants/${variantId}`)
    return unwrapApiData<unknown>(res.data)
}

export async function addProductSpecification(
    productId: number | string,
    payload: AdminSpecificationPayload
) {
    const res = await axiosClient.post(`/admin/products/${productId}/specifications`, payload)
    return unwrapApiData<AdminSpecificationItem>(res.data)
}

export async function updateProductSpecification(
    specificationId: number | string,
    payload: AdminSpecificationPayload
) {
    const res = await axiosClient.put(
        `/admin/products/specifications/${specificationId}`,
        payload
    )
    return unwrapApiData<AdminSpecificationItem>(res.data)
}

export async function deleteProductSpecification(specificationId: number | string) {
    const res = await axiosClient.delete(
        `/admin/products/specifications/${specificationId}`
    )
    return unwrapApiData<unknown>(res.data)
}

export async function addProductImage(
    productId: number | string,
    payload: AdminProductImagePayload
) {
    const res = await axiosClient.post(`/admin/products/${productId}/images`, payload)
    return unwrapApiData<AdminProductImageItem>(res.data)
}

export async function updateProductImage(
    imageId: number | string,
    payload: AdminProductImagePayload
) {
    const res = await axiosClient.put(`/admin/products/images/${imageId}`, payload)
    return unwrapApiData<AdminProductImageItem>(res.data)
}

export async function deleteProductImage(imageId: number | string) {
    const res = await axiosClient.delete(`/admin/products/images/${imageId}`)
    return unwrapApiData<unknown>(res.data)
}