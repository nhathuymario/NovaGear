import { type Product } from "../types/product"
import { getAllSiteContent } from "./siteContent"
import { POLICY_DEFINITIONS, getPolicyContent } from "./policies"

function formatCurrency(value: number) {
    return `${value.toLocaleString("vi-VN")}đ`
}

export function buildAiChatContext(products: Product[]): string[] {
    const siteContent = getAllSiteContent()

    const policyContext = POLICY_DEFINITIONS.map((policy) => {
        const content = getPolicyContent(policy.key).replace(/\n+/g, " ").trim()
        return `Chinh sach ${policy.title}: ${content}`
    })

    const productContext = products.slice(0, 12).map((product) => {
        const priceText = formatCurrency(product.salePrice ?? product.price)
        return `San pham: ${product.name}; Gia: ${priceText}; Nganh: ${product.category || "Khac"}; Mo ta: ${product.description || "Dang cap nhat"}`
    })

    return [
        "Ban la tro ly AI cua website NovaGear. Tra loi ngan gon, dung thong tin website va tieng Viet.",
        `Thong diep dau trang: ${siteContent.headerTopText}`,
        `Thong tin hotline: ${siteContent.headerHotlineText}`,
        `Thong diep khuyen mai: ${siteContent.homeFlashSaleText}`,
        ...policyContext,
        ...productContext,
    ]
}

