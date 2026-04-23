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

export interface RagSource {
    title: string
    excerpt: string
    score: number
}

export interface RagQueryResponse {
    question: string
    answer: string
    confidence: number
    mode: string
    sources: RagSource[]
}

interface RagQueryRequest {
    question: string
    context?: string[]
    top_k?: number
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

export async function askAiChat(
    question: string,
    options?: { context?: string[]; topK?: number }
): Promise<RagQueryResponse> {
    const normalizedQuestion = question.trim()
    if (!normalizedQuestion) {
        throw new Error("Question is required")
    }

    const payload: RagQueryRequest = {
        question: normalizedQuestion,
    }

    if (options?.context?.length) {
        payload.context = options.context
    }

    if (options?.topK) {
        payload.top_k = options.topK
    }

    const res = await axiosClient.post<RagQueryResponse>("/ai/v1/rag/query", payload)
    return res.data
}
