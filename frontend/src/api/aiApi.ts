import axiosClient from "./axiosClient"

export interface AiSearchResult {
    title: string
    excerpt: string
    score: number
    reason: string
}

interface AiSearchResponse {
    query: string
    backend: string
    results: AiSearchResult[]
}

export async function getAiSearchSuggestions(query: string, limit = 5): Promise<AiSearchResult[]> {
    const normalizedQuery = query.trim()
    if (!normalizedQuery) {
        return []
    }

    const res = await axiosClient.post<AiSearchResponse>("/ai/v1/search/suggest", {
        query: normalizedQuery,
        limit,
    })

    return res.data.results ?? []
}
