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
const MIN_PRODUCT_IMAGE_WIDTH = 800
const MIN_PRODUCT_IMAGE_HEIGHT = 800
const MIN_AVATAR_IMAGE_WIDTH = 240
const MIN_AVATAR_IMAGE_HEIGHT = 240

function normalizeClientUploadUrl(rawUrl: string): string {
    return normalizeUploadImageUrl(rawUrl)
}

async function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
    if (typeof createImageBitmap === "function") {
        const bitmap = await createImageBitmap(file)
        const dimensions = {width: bitmap.width, height: bitmap.height}
        bitmap.close()
        return dimensions
    }

    const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(String(reader.result ?? ""))
        reader.onerror = () => reject(new Error("Khong doc duoc anh upload"))
        reader.readAsDataURL(file)
    })

    return await new Promise<{ width: number; height: number }>((resolve, reject) => {
        const image = new Image()
        image.onload = () => resolve({width: image.naturalWidth, height: image.naturalHeight})
        image.onerror = () => reject(new Error("Khong doc duoc kich thuoc anh"))
        image.src = dataUrl
    })
}

async function validateImageFile(file: File, folder: "products" | "avatars") {
    if (!ALLOWED_IMAGE_MIME.has(file.type)) {
        throw new Error("Chi ho tro dinh dang JPG, JPEG, PNG, WEBP, GIF")
    }

    const {width, height} = await readImageDimensions(file)
    const minWidth = folder === "products" ? MIN_PRODUCT_IMAGE_WIDTH : MIN_AVATAR_IMAGE_WIDTH
    const minHeight = folder === "products" ? MIN_PRODUCT_IMAGE_HEIGHT : MIN_AVATAR_IMAGE_HEIGHT

    if (width < minWidth || height < minHeight) {
        throw new Error(
            folder === "products"
                ? `Anh qua nho (${width}x${height}). Vui long dung anh toi thieu ${MIN_PRODUCT_IMAGE_WIDTH}x${MIN_PRODUCT_IMAGE_HEIGHT} de tranh bi mo.`
                : `Anh dai dien qua nho (${width}x${height}). Vui long dung anh toi thieu ${MIN_AVATAR_IMAGE_WIDTH}x${MIN_AVATAR_IMAGE_HEIGHT}.`
        )
    }
}

async function uploadFile(file: File, folder: "products" | "avatars"): Promise<string> {
    await validateImageFile(file, folder)

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
