import axios, { type InternalAxiosRequestConfig } from "axios"
import { normalizeUploadImageUrl } from "../utils/image"

const gatewayUploadClient = axios.create({
    baseURL: "/api",
})

const directUploadClient = axios.create({
    baseURL: "/api-upload",
})

function attachAuthToken(config: InternalAxiosRequestConfig) {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
}

gatewayUploadClient.interceptors.request.use(attachAuthToken)
directUploadClient.interceptors.request.use(attachAuthToken)

const ALLOWED_IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/jpg"])

function normalizeClientUploadUrl(rawUrl: string): string {
    return normalizeUploadImageUrl(rawUrl)
}

function validateImageFile(file: File) {
    if (!ALLOWED_IMAGE_MIME.has(file.type)) {
        throw new Error("Chi ho tro dinh dang JPG, JPEG, PNG, WEBP, GIF")
    }
}

async function uploadFile(file: File, folder: "products" | "avatars"): Promise<string> {
    validateImageFile(file)

    const formData = new FormData()
    formData.append("file", file)

    const doUpload = async (baseClient: typeof gatewayUploadClient) => {
        const res = await baseClient.post(`/uploads/${folder}`, formData)
        const url = (
            res.data?.url ??
            res.data?.imageUrl ??
            res.data?.path ??
            res.data?.data?.url ??
            ""
        )
        return normalizeClientUploadUrl(url)
    }

    const preferDirectInDev = import.meta.env.DEV
    const clients = preferDirectInDev
        ? [directUploadClient, gatewayUploadClient]
        : [gatewayUploadClient, directUploadClient]

    let lastError: unknown = null
    for (const client of clients) {
        try {
            return await doUpload(client)
        } catch (error) {
            if (!axios.isAxiosError(error)) {
                throw error
            }

            const status = error.response?.status
            const retryable = status === 404 || status === 502 || status === 503 || !error.response
            if (!retryable) {
                throw error
            }
            lastError = error
        }
    }

    throw lastError ?? new Error("Upload failed")
}

export async function uploadProductImage(file: File): Promise<string> {
    return uploadFile(file, "products")
}

export async function uploadAvatarImage(file: File): Promise<string> {
    return uploadFile(file, "avatars")
}
