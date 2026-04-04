import axiosClient from "./axiosClient"

export interface AdminVariantPayload {
    sku: string
    color?: string
    ram?: string
    storage?: string
    versionName?: string
    price: number
    salePrice?: number
    stockQuantity?: number
    imageUrl?: string
    status?: "ACTIVE" | "OUT_OF_STOCK" | "INACTIVE"
}

export interface AdminSpecificationPayload {
    groupName: string
    specKey: string
    specValue: string
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

export async function addProductVariant(
    productId: number | string,
    payload: AdminVariantPayload
) {
    const res = await axiosClient.post(`/admin/products/${productId}/variants`, payload)
    return res.data
}

export async function updateProductVariant(
    variantId: number | string,
    payload: AdminVariantPayload
) {
    const res = await axiosClient.put(`/admin/products/variants/${variantId}`, payload)
    return res.data
}

export async function deleteProductVariant(variantId: number | string) {
    const res = await axiosClient.delete(`/admin/products/variants/${variantId}`)
    return res.data
}

export async function addProductSpecification(
    productId: number | string,
    payload: AdminSpecificationPayload
) {
    const res = await axiosClient.post(`/admin/products/${productId}/specifications`, payload)
    return res.data
}

export async function updateProductSpecification(
    specificationId: number | string,
    payload: AdminSpecificationPayload
) {
    const res = await axiosClient.put(
        `/admin/products/specifications/${specificationId}`,
        payload
    )
    return res.data
}

export async function deleteProductSpecification(specificationId: number | string) {
    const res = await axiosClient.delete(
        `/admin/products/specifications/${specificationId}`
    )
    return res.data
}