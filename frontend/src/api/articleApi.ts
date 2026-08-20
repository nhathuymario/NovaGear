import axiosClient from "./axiosClient"

export type ArticleStatus = "DRAFT" | "PUBLISHED"

export interface ArticleImageItem {
    id?: number
    imageUrl: string
    caption?: string
    displayOrder?: number
}

export interface ArticleItem {
    id: string
    title: string
    slug: string
    summary: string
    content: string
    cover_image_url: string
    category: string
    tags: string[]
    images: ArticleImageItem[]
    status: ArticleStatus
    author: string
    created_at: string
    updated_at: string
}

export interface ArticleListResponse {
    items: ArticleItem[]
    total: number
    page: number
    limit: number
}

export interface ArticleGenerateRequest {
    topic: string
    keywords: string[]
    tone: "professional" | "casual" | "review" | "tutorial"
    category: string
}

export interface ArticleCreateRequest {
    title: string
    slug?: string
    summary: string
    content: string
    cover_image_url?: string
    category: string
    tags: string[]
    images?: ArticleImageItem[]
    status: ArticleStatus
    author?: string
}

export interface ArticleUpdateRequest {
    title?: string
    summary?: string
    content?: string
    cover_image_url?: string
    category?: string
    tags?: string[]
    images?: ArticleImageItem[]
    status?: ArticleStatus
    author?: string
}

export async function getArticles(
    page = 0,
    limit = 20,
    category?: string,
    statusFilter?: string
): Promise<ArticleListResponse> {
    const params: Record<string, string | number> = {page, limit}
    if (category) params.category = category
    if (statusFilter) params.status_filter = statusFilter
    const res = await axiosClient.get<ArticleListResponse>("/admin/articles", {params})
    return res.data
}

export async function getArticleBySlug(slug: string): Promise<ArticleItem> {
    const res = await axiosClient.get<ArticleItem>(`/articles/public/${slug}`)
    return res.data
}

export async function generateArticle(data: ArticleGenerateRequest): Promise<ArticleItem> {
    const res = await axiosClient.post<ArticleItem>("/ai/v1/articles/generate", data)
    return res.data
}

export async function createArticle(data: ArticleCreateRequest): Promise<ArticleItem> {
    const res = await axiosClient.post<ArticleItem>("/admin/articles", data)
    return res.data
}

export async function updateArticle(id: string, data: ArticleUpdateRequest): Promise<ArticleItem> {
    const res = await axiosClient.put<ArticleItem>(`/admin/articles/${id}`, data)
    return res.data
}

export async function deleteArticle(id: string): Promise<void> {
    await axiosClient.delete(`/admin/articles/${id}`)
}

export async function uploadArticleImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)
    const res = await axiosClient.post<{url: string}>("/admin/articles/images/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" }
    })
    return res.data.url
}
