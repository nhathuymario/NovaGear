import axiosClient from "./axiosClient"

export type AiCatalogDraftStatus =
    | "QUEUED"
    | "PROCESSING"
    | "NEEDS_REVIEW"
    | "APPROVED"
    | "REJECTED"
    | "FAILED"

export interface AiCatalogVariantDraft {
    sku: string
    color?: string
    ram?: string
    storage?: string
    version_name?: string
    price?: number
    sale_price?: number
    confidence: number
}

export interface AiCatalogSpecificationDraft {
    group_name: string
    spec_key: string
    spec_value: string
    sort_order: number
}

export interface AiCatalogSource {
    title: string
    url: string
    publisher?: string
    source_type?: string
    excerpt?: string
    trust_score: number
}

export interface AiPriceObservation {
    seller?: string
    source_url: string
    price: number
    currency: string
    condition: string
    availability: string
    match_confidence: number
}

export interface AiCatalogProductDraft {
    name: string
    slug: string
    brand: string
    model_number?: string
    gtin?: string
    category_hint?: string
    short_description?: string
    description?: string
    confidence: number
    variants: AiCatalogVariantDraft[]
    specifications: AiCatalogSpecificationDraft[]
    sources: AiCatalogSource[]
    price_observations: AiPriceObservation[]
    warnings: string[]
}

export interface AiCatalogDraftJob {
    id: string
    status: AiCatalogDraftStatus
    original_filename: string
    hint?: string
    requested_by?: string
    result?: AiCatalogProductDraft
    error_message?: string
    approved_product_id?: string
    created_at: string
    updated_at: string
}

export async function createAiCatalogDraft(file: File, hint?: string): Promise<AiCatalogDraftJob> {
    const formData = new FormData()
    formData.append("file", file)
    if (hint?.trim()) formData.append("hint", hint.trim())

    const response = await axiosClient.post<AiCatalogDraftJob>("/ai/v1/catalog/drafts", formData, {
        headers: {"Content-Type": "multipart/form-data"},
    })
    return response.data
}

export async function getAiCatalogDraft(jobId: string): Promise<AiCatalogDraftJob> {
    const response = await axiosClient.get<AiCatalogDraftJob>(`/ai/v1/catalog/drafts/${jobId}`)
    return response.data
}

export async function waitForAiCatalogDraft(
    jobId: string,
    options: {timeoutMs?: number; intervalMs?: number} = {}
): Promise<AiCatalogDraftJob> {
    const timeoutMs = options.timeoutMs ?? 90_000
    const intervalMs = options.intervalMs ?? 1_200
    const startedAt = Date.now()

    while (Date.now() - startedAt < timeoutMs) {
        const job = await getAiCatalogDraft(jobId)
        if (["NEEDS_REVIEW", "APPROVED", "REJECTED", "FAILED"].includes(job.status)) {
            return job
        }
        await new Promise((resolve) => window.setTimeout(resolve, intervalMs))
    }
    throw new Error("AI xử lý quá thời gian. Draft vẫn đang chạy, hãy thử kiểm tra lại sau.")
}

export async function approveAiCatalogDraft(jobId: string, productId: number | string) {
    const response = await axiosClient.post<AiCatalogDraftJob>(`/ai/v1/catalog/drafts/${jobId}/approve`, {
        product_id: String(productId),
    })
    return response.data
}

export async function rejectAiCatalogDraft(jobId: string, reason: string) {
    const response = await axiosClient.post<AiCatalogDraftJob>(`/ai/v1/catalog/drafts/${jobId}/reject`, {reason})
    return response.data
}
