import {Link} from "react-router-dom"

export default function Footer() {
    return (
        <footer className="mt-14 border-t border-slate-200 bg-white">
            <div className="mx-auto grid max-w-[1280px] gap-8 px-4 py-10 md:grid-cols-3 md:px-5">
                <div className="space-y-3">
                    <h3 className="text-xl font-extrabold text-slate-900">NovaGear</h3>
                    <p className="text-sm text-slate-600">
                        Shop cong nghe toi gian, tap trung vao trai nghiem mua sam nhanh, ro rang va de chon.
                    </p>
                    <span
                        className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                        Trusted Electronics Store
                    </span>
                </div>

                <div>
                    <h4 className="font-bold text-slate-900">Hỗ trợ khách hàng</h4>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                        <Link to="/policies/bao-hanh" className="block hover:text-slate-900">Chinh sach bao hanh</Link>
                        <Link to="/policies/giao-hang" className="block hover:text-slate-900">Chinh sach giao hang</Link>
                        <Link to="/policies/thanh-toan" className="block hover:text-slate-900">Huong dan thanh toan</Link>
                        <Link to="/policies/ho-tro" className="block hover:text-slate-900">Lien he ho tro 24/7</Link>
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