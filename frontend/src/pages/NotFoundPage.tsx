import { Link } from "react-router-dom"

export default function NotFoundPage() {
    return (
        <div className="mx-auto max-w-2xl rounded-3xl bg-white p-10 text-center shadow-sm">
            <h1 className="text-5xl font-extrabold text-brand-dark">404</h1>
            <p className="mt-4 text-lg font-semibold">Trang không tồn tại</p>
            <p className="mt-2 text-brand-gray">
                Liên kết bạn truy cập có thể đã bị thay đổi hoặc không còn tồn tại.
            </p>

            <Link
                to="/"
                className="mt-6 inline-block rounded-xl bg-brand-dark px-5 py-3 font-semibold text-white"
            >
                Về trang chủ
            </Link>
        </div>
    )
}