import axiosClient from "./axiosClient";

export type VoucherDiscountType = "PERCENT" | "FIXED";
export type VoucherScopeType = "GLOBAL" | "PRODUCT" | "CATEGORY" | "MIXED";
export type VoucherNumberLike = number | string | null | undefined;

export interface AdminVoucherItem {
  id: number | string;
  code: string;
  name: string;
  description?: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  minimumOrderValue?: number | null;
  maximumDiscountAmount?: number | null;
  usageLimit?: number | null;
  usedCount?: number | null;
  remainingUsage?: number | null;
  userUsageLimit?: number | null;
  active: boolean;
  scopeType: VoucherScopeType;
  productIds: number[];
  categoryIds: number[];
  startAt?: string | null;
  endAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface AdminVoucherPayload {
  code: string;
  name: string;
  description?: string;
  discountType: VoucherDiscountType;
  discountValue: VoucherNumberLike;
  minimumOrderValue?: VoucherNumberLike;
  maximumDiscountAmount?: VoucherNumberLike;
  usageLimit?: VoucherNumberLike;
  userUsageLimit?: VoucherNumberLike;
  active?: boolean;
  scopeType: VoucherScopeType;
  productIds?: Array<number | string>;
  categoryIds?: Array<number | string>;
  startAt?: string | null;
  endAt?: string | null;
}

type RawVoucher = Partial<AdminVoucherItem> & {
  productIds?: Array<number | string>;
  categoryIds?: Array<number | string>;
};

export interface AdminVoucherPageResponse {
  content: AdminVoucherItem[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
}

function toNumber(value: unknown) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function mapVoucher(raw: RawVoucher): AdminVoucherItem {
  return {
    id: raw.id ?? "",
    code: raw.code ?? "",
    name: raw.name ?? "",
    description: raw.description ?? "",
    discountType: (raw.discountType ?? "PERCENT") as VoucherDiscountType,
    discountValue: Number(raw.discountValue ?? 0),
    minimumOrderValue: toNumber(raw.minimumOrderValue),
    maximumDiscountAmount: toNumber(raw.maximumDiscountAmount),
    usageLimit: toNumber(raw.usageLimit),
    usedCount: toNumber(raw.usedCount),
    remainingUsage: toNumber(raw.remainingUsage),
    userUsageLimit: toNumber(raw.userUsageLimit),
    active: Boolean(raw.active),
    scopeType: (raw.scopeType ?? "GLOBAL") as VoucherScopeType,
    productIds: Array.isArray(raw.productIds)
      ? raw.productIds.map(Number).filter(Number.isFinite)
      : [],
    categoryIds: Array.isArray(raw.categoryIds)
      ? raw.categoryIds.map(Number).filter(Number.isFinite)
      : [],
    startAt: raw.startAt ?? null,
    endAt: raw.endAt ?? null,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
  };
}

export async function getAdminVouchers(
  page = 0,
  size = 20,
  keyword?: string,
  scopeType?: VoucherScopeType | "",
  active?: boolean | "",
): Promise<AdminVoucherPageResponse> {
  const res = await axiosClient.get("/admin/vouchers", {
    params: {
      page,
      size,
      keyword,
      scopeType: scopeType || undefined,
      active: active === "" ? undefined : active,
    },
  });

  if (Array.isArray(res.data)) {
    return {
      content: res.data.map(mapVoucher),
      totalPages: 1,
      totalElements: res.data.length,
      number: 0,
      size: res.data.length,
    };
  }

  return {
    ...res.data,
    content: (res.data.content || []).map(mapVoucher),
  };
}

export async function getAdminVoucherDetail(id: number | string) {
  const res = await axiosClient.get(`/admin/vouchers/${id}`);
  return res.data;
}

export async function createAdminVoucher(payload: AdminVoucherPayload) {
  const res = await axiosClient.post("/admin/vouchers", payload);
  return res.data;
}

export async function updateAdminVoucher(
  id: number | string,
  payload: AdminVoucherPayload,
) {
  const res = await axiosClient.put(`/admin/vouchers/${id}`, payload);
  return res.data;
}

export async function deleteAdminVoucher(id: number | string) {
  const res = await axiosClient.delete(`/admin/vouchers/${id}`);
  return res.data;
}

export async function toggleAdminVoucherActive(id: number | string) {
  const res = await axiosClient.patch(`/admin/vouchers/${id}/toggle`);
  return res.data;
}
