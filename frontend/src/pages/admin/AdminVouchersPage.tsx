import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type SyntheticEvent,
} from "react";
import { toast } from "../../utils/toast";
import { useUIStore } from "../../store/useUIStore";
import {
  createAdminVoucher,
  deleteAdminVoucher,
  getAdminVouchers,
  toggleAdminVoucherActive,
  updateAdminVoucher,
  type AdminVoucherItem,
  type AdminVoucherPayload,
  type VoucherScopeType,
  type VoucherDiscountType,
} from "../../api/adminVoucherApi";
import {
  getAdminCategories,
  type AdminCategoryItem,
} from "../../api/adminCategoryApi";
import {
  getAdminProducts,
  type AdminProductItem,
} from "../../api/adminProductApi";

function deriveScopeType(
  productIds: Array<number | string> = [],
  categoryIds: Array<number | string> = [],
): VoucherScopeType {
  const hasProducts = productIds.length > 0;
  const hasCategories = categoryIds.length > 0;

  if (hasProducts && hasCategories) {
    return "MIXED";
  }
  if (hasProducts) {
    return "PRODUCT";
  }
  if (hasCategories) {
    return "CATEGORY";
  }
  return "GLOBAL";
}

const initialForm: AdminVoucherPayload = {
  code: "",
  name: "",
  description: "",
  discountType: "PERCENT",
  discountValue: 10,
  minimumOrderValue: null,
  maximumDiscountAmount: null,
  usageLimit: null,
  userUsageLimit: null,
  active: true,
  scopeType: "GLOBAL",
  productIds: [],
  categoryIds: [],
  startAt: "",
  endAt: "",
};

function scopeLabel(scope: VoucherScopeType) {
  switch (scope) {
    case "GLOBAL":
      return "Dùng chung";
    case "PRODUCT":
      return "Theo sản phẩm";
    case "CATEGORY":
      return "Theo danh mục";
    case "MIXED":
      return "Hỗn hợp";
    default:
      return scope;
  }
}

function discountLabel(type: VoucherDiscountType, value: number) {
  return type === "PERCENT"
    ? `${value}%`
    : `${Number(value).toLocaleString("vi-VN")}đ`;
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
}

function ProductSelectionModal({
  categories,
  selectedIds,
  onSave,
  onClose,
}: {
  categories: AdminCategoryItem[];
  selectedIds: number[];
  onSave: (ids: number[]) => void;
  onClose: () => void;
}) {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState<number | string>("");
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [localSelectedIds, setLocalSelectedIds] =
    useState<number[]>(selectedIds);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAdminProducts(page, size, keyword, categoryId);
      setProducts(res.content || []);
      setTotalPages(res.totalPages || 0);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, size, keyword, categoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleSelect = (id: number) => {
    setLocalSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newIds = products
        .map((p) => Number(p.id))
        .filter((id) => !localSelectedIds.includes(id));
      setLocalSelectedIds((prev) => [...prev, ...newIds]);
    } else {
      const pageIds = products.map((p) => Number(p.id));
      setLocalSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    }
  };

  const isAllPageSelected =
    products.length > 0 &&
    products.every((p) => localSelectedIds.includes(Number(p.id)));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="flex h-full max-h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-bold text-slate-800">Chọn sản phẩm</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-wrap gap-3 border-b border-slate-200 bg-slate-50/50 p-4">
          <input
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(0);
            }}
            placeholder="Tìm tên sản phẩm..."
            className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white"
          />
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(0);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <select
            value={size}
            onChange={(e) => {
              setSize(Number(e.target.value));
              setPage(0);
            }}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400 focus:bg-white"
          >
            <option value={10}>10 dòng / trang</option>
            <option value={20}>20 dòng / trang</option>
            <option value={50}>50 dòng / trang</option>
          </select>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-sm text-slate-500">
              Đang tải dữ liệu...
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600">
                    Sản phẩm
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-slate-600 w-48">
                    Danh mục
                  </th>
                  <th className="px-4 py-3 text-right w-16">
                    <input
                      type="checkbox"
                      checked={isAllPageSelected}
                      onChange={handleSelectAll}
                      className="rounded border-slate-300"
                    />
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/80 transition cursor-pointer"
                    onClick={() => toggleSelect(Number(p.id))}
                  >
                    <td className="px-4 py-3 font-medium text-slate-700">
                      {p.name}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {p.categoryName || "-"}
                    </td>
                    <td
                      className="px-4 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={localSelectedIds.includes(Number(p.id))}
                        onChange={() => toggleSelect(Number(p.id))}
                        className="rounded border-slate-300"
                      />
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-500">
                      Không tìm thấy sản phẩm phù hợp
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-4 gap-3">
          <div className="flex items-center gap-3 text-sm">
            <button
              disabled={page <= 0}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-50 bg-white hover:bg-slate-50 font-medium text-slate-600"
            >
              Trang trước
            </button>
            <span className="text-slate-600 font-medium">
              Trang {page + 1} / {Math.max(totalPages, 1)}
            </span>
            <button
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:opacity-50 bg-white hover:bg-slate-50 font-medium text-slate-600"
            >
              Trang sau
            </button>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-admin-accent bg-admin-accent/10 px-3 py-1.5 rounded-lg">
              Đã chọn: {localSelectedIds.length}
            </span>
            <button
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Hủy
            </button>
            <button
              onClick={() => onSave(localSelectedIds)}
              className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminVouchersPage() {
  const { requestConfirm } = useUIStore();
  const [items, setItems] = useState<AdminVoucherItem[]>([]);
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [scopeFilter, setScopeFilter] = useState<VoucherScopeType | "">("");
  const [activeFilter, setActiveFilter] = useState<boolean | "">("");
  const [openForm, setOpenForm] = useState(false);
  const [editingId, setEditingId] = useState<number | string | null>(null);
  const [form, setForm] = useState<AdminVoucherPayload>(initialForm);
  const [showProductModal, setShowProductModal] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [voucherPage, categoryItems] = await Promise.all([
        getAdminVouchers(page, 20, keyword, scopeFilter, activeFilter),
        getAdminCategories(),
      ]);
      setItems(voucherPage.content);
      setTotalPages(voucherPage.totalPages || 0);
      setCategories(categoryItems);
    } catch (error) {
      console.error(error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [activeFilter, keyword, page, scopeFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredSelectedCategories = useMemo(() => {
    return categories.filter((category) =>
      form.categoryIds?.includes(Number(category.id)),
    );
  }, [categories, form.categoryIds]);

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setOpenForm(false);
  };

  const handleCreate = () => {
    setEditingId(null);
    setForm(initialForm);
    setOpenForm(true);
  };

  const handleEdit = (item: AdminVoucherItem) => {
    setEditingId(item.id);
    setForm({
      code: item.code,
      name: item.name,
      description: item.description || "",
      discountType: item.discountType,
      discountValue: item.discountValue,
      minimumOrderValue: item.minimumOrderValue ?? null,
      maximumDiscountAmount: item.maximumDiscountAmount ?? null,
      usageLimit: item.usageLimit ?? null,
      userUsageLimit: item.userUsageLimit ?? null,
      active: item.active,
      scopeType: item.scopeType,
      productIds: item.productIds || [],
      categoryIds: item.categoryIds || [],
      startAt: item.startAt || "",
      endAt: item.endAt || "",
    });
    setOpenForm(true);
  };

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      setSaving(true);
      const payload: AdminVoucherPayload = {
        ...form,
        code: String(form.code || "")
          .trim()
          .toUpperCase(),
        name: String(form.name || "").trim(),
        description: String(form.description || "").trim(),
        productIds: form.productIds || [],
        categoryIds: form.categoryIds || [],
        startAt: form.startAt || null,
        endAt: form.endAt || null,
      };

      if (editingId) {
        await updateAdminVoucher(editingId, payload);
      } else {
        await createAdminVoucher(payload);
      }

      toast.success(
        editingId ? "Cập nhật voucher thành công" : "Tạo voucher thành công",
      );
      resetForm();
      await loadData();
    } catch (error) {
      console.error(error);
      toast.error("Lưu voucher thất bại");
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id: number | string) => {
    try {
      await toggleAdminVoucherActive(id);
      await loadData();
      toast.success("Đã cập nhật trạng thái voucher");
    } catch (error) {
      console.error(error);
      toast.error("Cập nhật trạng thái thất bại");
    }
  };

  const handleDelete = async (id: number | string) => {
    if (!(await requestConfirm("Bạn có chắc muốn xóa voucher này?"))) return;
    try {
      await deleteAdminVoucher(id);
      await loadData();
      toast.success("Xóa voucher thành công");
    } catch (error) {
      console.error(error);
      toast.error("Xóa voucher thất bại");
    }
  };

  const handleSaveProducts = (ids: number[]) => {
    setForm((prev) => ({
      ...prev,
      productIds: ids,
      scopeType: deriveScopeType(ids, prev.categoryIds || []),
    }));
    setShowProductModal(false);
  };

  const toggleCategory = (id: number | string) => {
    const normalized = Number(id);
    setForm((prev) => {
      const current = new Set((prev.categoryIds || []).map(Number));
      if (current.has(normalized)) current.delete(normalized);
      else current.add(normalized);

      const nextCategories = Array.from(current);
      return {
        ...prev,
        categoryIds: nextCategories,
        scopeType: deriveScopeType(prev.productIds || [], nextCategories),
      };
    });
  };

  const handleScopeTypeChange = (scopeType: VoucherScopeType) => {
    setForm((prev) => {
      if (scopeType === "GLOBAL") {
        return { ...prev, scopeType, productIds: [], categoryIds: [] };
      }
      if (scopeType === "PRODUCT") {
        return { ...prev, scopeType, categoryIds: [] };
      }
      if (scopeType === "CATEGORY") {
        return { ...prev, scopeType, productIds: [] };
      }
      return { ...prev, scopeType };
    });
  };

  let submitLabel = "Tạo voucher";
  if (editingId) {
    submitLabel = "Cập nhật voucher";
  }
  if (saving) {
    submitLabel = "Đang lưu...";
  }

  if (loading)
    return (
      <div className="flex h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-accent border-t-transparent" />
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Quản lý voucher</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Voucher dùng chung, theo sản phẩm hoặc theo danh mục.
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110"
        >
          + Thêm voucher
        </button>
      </div>

      <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-4">
        <input
          value={keyword}
          onChange={(e) => {
            setPage(0);
            setKeyword(e.target.value);
          }}
          placeholder="Tìm mã / tên voucher..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white"
        />
        <select
          value={scopeFilter}
          onChange={(e) => {
            setPage(0);
            setScopeFilter(e.target.value as VoucherScopeType | "");
          }}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white"
        >
          <option value="">Tất cả scope</option>
          <option value="GLOBAL">Dùng chung</option>
          <option value="PRODUCT">Theo sản phẩm</option>
          <option value="CATEGORY">Theo danh mục</option>
          <option value="MIXED">Hỗn hợp</option>
        </select>
        <select
          value={String(activeFilter)}
          onChange={(e) => {
            setPage(0);
            setActiveFilter(
              e.target.value === "" ? "" : e.target.value === "true",
            );
          }}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="true">Đang hoạt động</option>
          <option value="false">Đã tắt</option>
        </select>
        <button
          onClick={() => void loadData()}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        >
          Làm mới
        </button>
      </div>

      {openForm && (
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="grid gap-3 md:grid-cols-2">
            <input
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })}
              placeholder="Mã voucher"
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white"
            />
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Tên voucher"
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white"
            />
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Mô tả"
              className="min-h-24 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white md:col-span-2"
            />
            <select
              value={form.discountType}
              onChange={(e) =>
                setForm({
                  ...form,
                  discountType: e.target.value as VoucherDiscountType,
                })
              }
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white"
            >
              <option value="PERCENT">Phần trăm</option>
              <option value="FIXED">Số tiền cố định</option>
            </select>
            <input
              type="number"
              value={form.discountValue ?? ""}
              onChange={(e) =>
                setForm({ ...form, discountValue: e.target.value })
              }
              placeholder="Giá trị giảm"
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white"
            />
            <select
              value={form.scopeType}
              onChange={(e) =>
                handleScopeTypeChange(e.target.value as VoucherScopeType)
              }
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white"
            >
              <option value="GLOBAL">Dùng chung</option>
              <option value="PRODUCT">Dùng riêng theo sản phẩm</option>
              <option value="CATEGORY">Dùng riêng theo danh mục</option>
              <option value="MIXED">Dùng riêng nhiều mục</option>
            </select>
            <input
              type="number"
              value={form.minimumOrderValue ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  minimumOrderValue:
                    e.target.value === "" ? null : e.target.value,
                })
              }
              placeholder="Đơn tối thiểu"
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white"
            />
            <input
              type="number"
              value={form.maximumDiscountAmount ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  maximumDiscountAmount:
                    e.target.value === "" ? null : e.target.value,
                })
              }
              placeholder="Giảm tối đa"
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white"
            />
            <input
              type="number"
              value={form.usageLimit ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  usageLimit: e.target.value === "" ? null : e.target.value,
                })
              }
              placeholder="Tổng lượt dùng"
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white"
            />
            <input
              type="number"
              value={form.userUsageLimit ?? ""}
              onChange={(e) =>
                setForm({
                  ...form,
                  userUsageLimit: e.target.value === "" ? null : e.target.value,
                })
              }
              placeholder="Lượt dùng mỗi user"
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white"
            />
            <input
              type="datetime-local"
              value={form.startAt || ""}
              onChange={(e) => setForm({ ...form, startAt: e.target.value })}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white"
            />
            <input
              type="datetime-local"
              value={form.endAt || ""}
              onChange={(e) => setForm({ ...form, endAt: e.target.value })}
              className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-slate-400 focus:bg-white"
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={Boolean(form.active)}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            <span>Đang hoạt động</span>
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-slate-800">
                  Chọn sản phẩm áp dụng
                </h3>
                <button
                  type="button"
                  onClick={() => setShowProductModal(true)}
                  className="text-xs font-semibold text-admin-accent hover:underline"
                >
                  Mở popup chọn
                </button>
              </div>
              <div className="text-sm text-slate-600">
                Đã chọn{" "}
                <span className="font-semibold">
                  {form.productIds?.length || 0}
                </span>{" "}
                sản phẩm.
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-800">
                Chọn danh mục áp dụng
              </h3>
              <div className="max-h-56 space-y-2 overflow-auto pr-1">
                {categories.map((category) => (
                  <label
                    key={String(category.id)}
                    className="flex items-center gap-2 rounded-lg border border-slate-100 px-3 py-2 text-sm hover:bg-slate-50"
                  >
                    <input
                      type="checkbox"
                      checked={(form.categoryIds || []).includes(
                        Number(category.id),
                      )}
                      onChange={() => toggleCategory(category.id)}
                    />
                    <span className="truncate">{category.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-admin-accent px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitLabel}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
            >
              Hủy
            </button>
          </div>
          <div className="text-xs text-slate-500">
            Scope hiện tại: {scopeLabel(form.scopeType)} | Sản phẩm đã chọn:{" "}
            {form.productIds?.length || 0} | Danh mục đã chọn:{" "}
            {filteredSelectedCategories.length}
          </div>
        </form>
      )}

      {showProductModal && (
        <ProductSelectionModal
          categories={categories}
          selectedIds={(form.productIds || []).map(Number)}
          onSave={handleSaveProducts}
          onClose={() => setShowProductModal(false)}
        />
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead>
              <tr className="bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Mã
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Tên
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Giảm
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Scope
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Trạng thái
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Hạn dùng
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.map((item) => (
                <tr
                  key={String(item.id)}
                  className="transition hover:bg-slate-50/80"
                >
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {item.code}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{item.name}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {discountLabel(item.discountType, item.discountValue)}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {scopeLabel(item.scopeType)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${item.active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {item.active ? "Hoạt động" : "Tắt"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {formatDate(item.endAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => void handleToggle(item.id)}
                        className="rounded-lg border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700 hover:bg-amber-50"
                      >
                        Bật/Tắt
                      </button>
                      <button
                        onClick={() => void handleDelete(item.id)}
                        className="rounded-lg border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50"
                      >
                        Xóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-brand-gray"
                  >
                    Không có voucher nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-slate-600">
        <button
          disabled={page <= 0}
          onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-50"
        >
          Trang trước
        </button>
        <span>
          Trang {page + 1} / {Math.max(totalPages, 1)}
        </span>
        <button
          disabled={page + 1 >= totalPages}
          onClick={() => setPage((prev) => prev + 1)}
          className="rounded-lg border border-slate-200 px-3 py-2 disabled:opacity-50"
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}
