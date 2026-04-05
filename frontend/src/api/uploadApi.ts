import axios from "axios"

const uploadClient = axios.create({
    baseURL: "",
})

uploadClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("token")
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export async function uploadProductImage(file: File): Promise<string> {
    const formData = new FormData()
    formData.append("file", file)

    const res = await uploadClient.post("/uploads/products", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    })

    return (
        res.data?.url ??
        res.data?.imageUrl ??
        res.data?.path ??
        res.data?.data?.url ??
        ""
    )
}