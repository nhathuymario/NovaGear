export default function Footer() {
    return (
        <footer className="mt-14 border-t border-slate-200 bg-white">
            <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 md:grid-cols-3 md:px-5">
                <div className="space-y-3">
                    <h3 className="text-xl font-extrabold text-slate-900">NovaGear</h3>
                    <p className="text-sm text-slate-600">
                        Shop công nghệ thối giản, tập trung vào trải nghiệm mua sắm nhanh, rỏ ráng và dễ chọn.
                    </p>
                    <span
                        className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        Trusted Electronics Store
                    </span>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900">Hỗ trợ khách hàng</h4>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                        <p>Chính sách bảo hành</p>
                        <p>Chính sách giao hàng</p>
                        <p>Hướng dẫn thanh toán</p>
                        <p>Liên hệ hỗ trợ 24/7</p>
                    </div>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900">Thông tin</h4>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                        <p>Email: support@novagear.vn</p>
                        <p>Hotline: 0123 456 789</p>
                        <p>Giờ hỗ trợ: 8:00 - 22:00 (Mon - Sun)</p>
                    </div>
                </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50 py-3 text-center text-xs text-slate-500">
                © 2026 NovaGear. All rights reserved.
            </div>
        </footer>
    )
}