import {Link} from "react-router-dom"
import {Phone, Mail, Clock, MapPin, ShieldCheck, Truck, CreditCard, HeadphonesIcon} from "lucide-react"

export default function Footer() {
    const logoUrl = ""
    return (
        <footer className="mt-8 bg-white border-t border-slate-200">
            {/* Trust badges */}
            <div className="border-b border-slate-100">
                <div className="mx-auto grid max-w-[1320px] grid-cols-2 gap-4 px-4 py-6 md:grid-cols-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-yellow/20 text-brand-dark">
                            <Truck className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Giao hàng nhanh</p>
                            <p className="text-xs text-slate-500">Nội thành 2h</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-brand-blue">
                            <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Chính hãng 100%</p>
                            <p className="text-xs text-slate-500">Bảo hành toàn quốc</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-green/10 text-brand-green">
                            <CreditCard className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Thanh toán tiện lợi</p>
                            <p className="text-xs text-slate-500">Nhiều hình thức</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-orange/10 text-brand-orange">
                            <HeadphonesIcon className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-slate-900">Hỗ trợ 24/7</p>
                            <p className="text-xs text-slate-500">Tư vấn miễn phí</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main footer */}
            <div className="mx-auto max-w-[1320px] px-4 py-8">
                <div className="grid gap-8 md:grid-cols-4">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            {logoUrl ? (
                                <img src={logoUrl} alt="NovaGear" className="h-9 w-9 rounded-xl object-contain" />
                            ) : (
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-yellow text-sm font-black text-brand-dark">
                                    NG
                                </div>
                            )}
                            <span className="text-lg font-black text-slate-900">NovaGear</span>
                        </div>
                        <p className="text-sm leading-relaxed text-slate-600">
                            Hệ thống bán lẻ công nghệ uy tín, giá tốt nhất. Cam kết hàng chính hãng, bảo hành đầy đủ.
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="rounded-full bg-brand-yellow/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-dark">
                                Trusted Store
                            </span>
                        </div>
                    </div>

                    {/* Customer support */}
                    <div>
                        <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">Hỗ trợ khách hàng</h4>
                        <div className="space-y-2.5 text-sm text-slate-600">
                            <Link to="/policies/bao-hanh" className="block transition hover:text-brand-blue">Chính sách bảo hành</Link>
                            <Link to="/policies/giao-hang" className="block transition hover:text-brand-blue">Chính sách giao hàng</Link>
                            <Link to="/policies/thanh-toan" className="block transition hover:text-brand-blue">Hướng dẫn thanh toán</Link>
                            <Link to="/policies/doi-tra" className="block transition hover:text-brand-blue">Chính sách đổi trả</Link>
                            <Link to="/policies/ho-tro" className="block transition hover:text-brand-blue">Liên hệ hỗ trợ</Link>
                        </div>
                    </div>

                    {/* Quick links */}
                    <div>
                        <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">Tài khoản</h4>
                        <div className="space-y-2.5 text-sm text-slate-600">
                            <Link to="/profile" className="block transition hover:text-brand-blue">Thông tin tài khoản</Link>
                            <Link to="/orders" className="block transition hover:text-brand-blue">Lịch sử đơn hàng</Link>
                            <Link to="/cart" className="block transition hover:text-brand-blue">Giỏ hàng</Link>
                            <Link to="/products" className="block transition hover:text-brand-blue">Sản phẩm</Link>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-900">Liên hệ</h4>
                        <div className="space-y-3 text-sm text-slate-600">
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-brand-blue" />
                                <span className="font-semibold">0123 456 789</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-brand-blue" />
                                <span>support@novagear.vn</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-brand-blue" />
                                <span>8:00 - 22:00 (T2 - CN)</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-blue" />
                                <span>TP. Hồ Chí Minh, Việt Nam</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-slate-100 bg-slate-50">
                <div className="mx-auto max-w-[1320px] px-4 py-4 text-center text-xs text-slate-500">
                    <p>© 2026 NovaGear. All rights reserved. Made with ❤️ in Vietnam</p>
                </div>
            </div>
        </footer>
    )
}