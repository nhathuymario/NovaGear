export type PolicyKey = "warranty" | "shipping" | "payment" | "support"

export type PolicyDefinition = {
    key: PolicyKey
    slug: string
    title: string
    summary: string
    defaultContent: string
}

const STORAGE_PREFIX = "novagear-policy:"

export const POLICY_DEFINITIONS: PolicyDefinition[] = [
    {
        key: "warranty",
        slug: "bao-hanh",
        title: "Chinh sach bao hanh",
        summary: "Thong tin bao hanh san pham va huong dan tiep nhan bao hanh.",
        defaultContent: [
            "1. San pham duoc bao hanh theo chinh sach cua hang va hang san xuat.",
            "2. Thoi gian tiep nhan bao hanh: 8:00 - 22:00 moi ngay.",
            "3. Khach hang can cung cap hoa don hoac thong tin don hang.",
            "4. Cac loi do va dap, vao nuoc, can thiep phan cung khong thuoc pham vi bao hanh.",
        ].join("\n"),
    },
    {
        key: "shipping",
        slug: "giao-hang",
        title: "Chinh sach giao hang",
        summary: "Phi van chuyen, thoi gian giao du kien va pham vi phuc vu.",
        defaultContent: [
            "1. Don hang duoc xac nhan truoc 16:00 se duoc xu ly trong ngay.",
            "2. Noi thanh du kien 2-24 gio, ngoai thanh 2-5 ngay lam viec.",
            "3. Mien phi van chuyen cho don hang tu 500.000d (tuy khu vuc).",
            "4. Don hang co gia tri cao co the can xac minh truoc khi giao.",
        ].join("\n"),
    },
    {
        key: "payment",
        slug: "thanh-toan",
        title: "Huong dan thanh toan",
        summary: "Cac hinh thuc thanh toan online va COD dang ho tro.",
        defaultContent: [
            "1. Ho tro COD cho khu vuc du dieu kien.",
            "2. Ho tro thanh toan online qua cong thanh toan duoc tich hop.",
            "3. Don hang online can thanh toan thanh cong de xac nhan.",
            "4. Vui long khong chia se OTP va thong tin tai khoan thanh toan.",
        ].join("\n"),
    },
    {
        key: "support",
        slug: "ho-tro",
        title: "Lien he ho tro 24/7",
        summary: "Kenh lien he ho tro khach hang cua NovaGear.",
        defaultContent: [
            "1. Hotline: 0123 456 789",
            "2. Email: support@novagear.vn",
            "3. Khung gio ho tro: 8:00 - 22:00 (Mon - Sun)",
            "4. Vui long cung cap ma don hang de duoc ho tro nhanh hon.",
        ].join("\n"),
    },
]

export function getPolicyBySlug(slug?: string) {
    return POLICY_DEFINITIONS.find((item) => item.slug === slug)
}

export function getPolicyContent(key: PolicyKey): string {
    const def = POLICY_DEFINITIONS.find((item) => item.key === key)
    if (!def) return ""

    if (typeof window === "undefined") {
        return def.defaultContent
    }

    const stored = localStorage.getItem(STORAGE_PREFIX + key)
    return stored && stored.trim().length > 0 ? stored : def.defaultContent
}

export function savePolicyContent(key: PolicyKey, content: string) {
    if (typeof window === "undefined") return
    localStorage.setItem(STORAGE_PREFIX + key, content.trim())
}

