import {Link, useParams} from "react-router-dom"
import {getPolicyBySlug, getPolicyContent} from "../utils/policies"

export default function PolicyPage() {
    const {slug = ""} = useParams()
    const policy = getPolicyBySlug(slug)

    if (!policy) {
        return (
            <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">Khong tim thay chinh sach</h1>
                <p className="mt-2 text-sm text-slate-600">Noi dung ban yeu cau hien khong ton tai.</p>
                <Link to="/" className="mt-5 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
                    Quay ve trang chu
                </Link>
            </div>
        )
    }

    const content = getPolicyContent(policy.key)

    return (
        <div className="mx-auto max-w-4xl space-y-5 rounded-3xl bg-white p-8 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">NovaGear Policies</p>
            <h1 className="text-3xl font-bold text-slate-900">{policy.title}</h1>
            <p className="text-sm text-slate-600">{policy.summary}</p>

            <div className="rounded-2xl bg-slate-50 p-5">
                <p className="whitespace-pre-line text-sm leading-7 text-slate-700">{content}</p>
            </div>
        </div>
    )
}

