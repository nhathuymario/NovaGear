import axiosClient from "./axiosClient";

export interface PublicVoucherResponse {
  id: number;
  code: string;
  name: string;
  description: string;
  discountType: "PERCENT" | "FIXED";
  discountValue: number;
  minimumOrderValue: number | null;
  maximumDiscountAmount: number | null;
  scopeType: "GLOBAL" | "PRODUCT" | "CATEGORY" | "MIXED";
  productIds: number[];
  categoryIds: number[];
}

let activeVouchersCache: PublicVoucherResponse[] | null = null;
let activeVouchersCacheTime = 0;

export async function getActiveVouchers(
  productId?: number | string,
  categoryId?: number | string,
): Promise<PublicVoucherResponse[]> {
  const now = Date.now();
  // Cache for 30 seconds
  if (!activeVouchersCache || now - activeVouchersCacheTime > 30000) {
    const res = await axiosClient.get("/vouchers");
    activeVouchersCache = res.data?.data || [];
    activeVouchersCacheTime = now;
  }

  let result = activeVouchersCache || [];

  if (productId != null || categoryId != null) {
    const pId = productId ? Number(productId) : null;
    const cId = categoryId ? Number(categoryId) : null;

    return result.filter((v) => {
      if (v.scopeType === "GLOBAL") return true;
      if (v.scopeType === "PRODUCT" && pId != null) {
        return v.productIds?.includes(pId);
      }
      if (v.scopeType === "CATEGORY" && cId != null) {
        return v.categoryIds?.includes(cId);
      }
      if (v.scopeType === "MIXED") {
        const pMatch = pId != null && v.productIds?.includes(pId);
        const cMatch = cId != null && v.categoryIds?.includes(cId);
        return pMatch || cMatch;
      }
      return false;
    });
  }

  return result;
}
