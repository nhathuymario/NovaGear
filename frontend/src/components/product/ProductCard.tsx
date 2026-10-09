import { Link } from "react-router-dom";
import type { Product } from "../../types/product";
import { getFallbackImageSrc, handleImageError } from "../../utils/image";
import { Star } from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import {
  getActiveVouchers,
  type PublicVoucherResponse,
} from "../../api/publicVoucherApi";

interface Props {
  readonly product: Product;
}

export default function ProductCard({ product }: Readonly<Props>) {
  const [vouchers, setVouchers] = useState<PublicVoucherResponse[]>([]);

  useEffect(() => {
    getActiveVouchers(product.id, product.categoryId)
      .then(setVouchers)
      .catch(console.error);
  }, [product.id, product.categoryId]);

  const originalPrice = product.price;

  const bestVoucher = useMemo(() => {
    if (!originalPrice || vouchers.length === 0) return null;
    let maxDiscount = 0;
    let best: PublicVoucherResponse | null = null;
    for (const v of vouchers) {
      let discount = 0;
      if (v.discountType === "PERCENT") {
        discount = originalPrice * (v.discountValue / 100);
        if (v.maximumDiscountAmount) {
          discount = Math.min(discount, v.maximumDiscountAmount);
        }
      } else {
        discount = v.discountValue;
      }
      if (v.minimumOrderValue && originalPrice < v.minimumOrderValue) continue;
      if (discount > maxDiscount) {
        maxDiscount = discount;
        best = v;
      }
    }
    return best ? { voucher: best, discountAmount: maxDiscount } : null;
  }, [originalPrice, vouchers]);

  const finalPrice = Math.max(
    0,
    originalPrice - (bestVoucher?.discountAmount ?? 0),
  );

  return (
    <article className="product-card-hover group relative overflow-hidden rounded-xl border border-slate-200 bg-white">
      <Link to={`/products/${product.slug}`} className="block">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-slate-50 p-4">
          <img
            src={product.imageUrl || getFallbackImageSrc("NovaGear")}
            alt={product.name}
            loading="lazy"
            decoding="async"
            sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw"
            className="h-full w-full object-contain transition duration-400 group-hover:scale-105"
            data-fallback={getFallbackImageSrc("NovaGear")}
            onError={handleImageError}
          />
          {bestVoucher != null && (
            <div className="absolute right-2 top-2 z-10 rounded-full bg-brand-red px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
              -
              {bestVoucher.voucher.discountType === "PERCENT"
                ? `${bestVoucher.voucher.discountValue}%`
                : `${bestVoucher.voucher.discountValue / 1000}k`}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="line-clamp-2 min-h-[40px] text-sm font-medium text-slate-800 transition group-hover:text-brand-blue">
            {product.name}
          </h3>

          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-lg font-extrabold text-brand-red">
              {finalPrice.toLocaleString("vi-VN")}₫
            </p>
            {bestVoucher != null && (
              <p className="text-xs text-slate-400 line-through">
                {originalPrice.toLocaleString("vi-VN")}₫
              </p>
            )}
          </div>

          {/* Rating & stock */}
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-3 w-3 fill-brand-yellow text-brand-yellow"
                />
              ))}
            </div>
            <span
              className={`text-[10px] font-semibold ${
                (product.stock ?? 0) > 0 ? "text-brand-green" : "text-slate-400"
              }`}
            >
              {(product.stock ?? 0) > 0 ? "Còn hàng" : "Hết hàng"}
            </span>
          </div>

          {/* Installment tag */}
          {finalPrice >= 3000000 && (
            <div className="mt-2 rounded-md bg-brand-blue/5 px-2 py-1 text-center text-[10px] font-semibold text-brand-blue">
              Trả góp 0%
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
