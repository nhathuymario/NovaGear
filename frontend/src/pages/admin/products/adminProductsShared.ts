import type {
    AdminProductPayload,
} from "../../../api/adminProductApi"
import type {
    AdminSpecificationPayload,
    AdminVariantPayload,
} from "../../../api/adminProductDetailApi"

export interface CategoryOption {
    id: number | string
    name: string
}

export type Tab = "list" | "form" | "detail"
export type DetailTab = "variants" | "images" | "specs"

export type VariantImportForm = {
    quantity: number
}

export type VariantImportMessage = {
    type: "success" | "error"
    text: string
}

export const INITIAL_PRODUCT_FORM: AdminProductPayload = {
    name: "",
    slug: "",
    brand: "",
    categoryId: "",
    shortDescription: "",
    description: "",
    thumbnail: "",
    status: "ACTIVE",
    featured: false,
}

export const INITIAL_VARIANT_FORM: AdminVariantPayload = {
    sku: "",
    color: "",
    ram: "",
    storage: "",
    versionName: "",
    price: 0,
    salePrice: undefined,
    stockQuantity: 0,
    imageUrl: "",
    status: "ACTIVE",
}

export const INITIAL_SPEC_FORM: AdminSpecificationPayload = {
    groupName: "",
    specKey: "",
    specValue: "",
    sortOrder: 0,
}

export const DEFAULT_IMPORT_FORM: VariantImportForm = {
    quantity: 1,
}

export function slugify(text: string): string {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .trim()
        .replace(/\s+/g, "-")
}

