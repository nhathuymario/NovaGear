export default function Footer() {
    return (
        <footer className="mt-10 border-t bg-white">
            <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 md:grid-cols-3">
                <div>
                    <h3 className="text-lg font-bold">NovaGear</h3>
                    <p className="mt-2 text-sm text-brand-gray">
                        Shop công nghệ theo phong cách tối giản, hiện đại, dễ dùng.
                    </p>
                </div>

                <div>
                    <h4 className="font-semibold">Hỗ trợ</h4>
                    <p className="mt-2 text-sm text-brand-gray">Chính sách bảo hành</p>
                    <p className="text-sm text-brand-gray">Chính sách giao hàng</p>
                    <p className="text-sm text-brand-gray">Liên hệ</p>
                </div>

                <div>
                    <h4 className="font-semibold">Thông tin</h4>
                    <p className="mt-2 text-sm text-brand-gray">Email: support@novagear.vn</p>
                    <p className="text-sm text-brand-gray">Hotline: 0123 456 789</p>
                </div>
            </div>
        </footer>
    )
}