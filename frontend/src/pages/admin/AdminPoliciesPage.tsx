import {useMemo, useState} from "react"
import {getPolicyContent, POLICY_DEFINITIONS, type PolicyKey, savePolicyContent} from "../../utils/policies"
import {getAllSiteContent, saveAllSiteContent, type SiteContentKey} from "../../utils/siteContent"

const SITE_CONTENT_FIELDS: Array<{ key: SiteContentKey; label: string; hint: string; multiline?: boolean }> = [
    {
        key: "headerTopText",
        label: "Header top text",
        hint: ""
    },
    {
        key: "headerHotlineText",
        label: "Header hotline text",
        hint: ""
    },
    {
        key: "homeFlashSaleText",
        label: "Home flash banner text",
        hint: "",
        multiline: true,
    },
]

export default function AdminPoliciesPage() {
    const [activeKey, setActiveKey] = useState<PolicyKey>("warranty")
    const [draft, setDraft] = useState<Record<PolicyKey, string>>(() => ({
        warranty: getPolicyContent("warranty"),
        shipping: getPolicyContent("shipping"),
        payment: getPolicyContent("payment"),
        support: getPolicyContent("support"),
    }))
    const [message, setMessage] = useState("")
    const [siteContentDraft, setSiteContentDraft] = useState<Record<SiteContentKey, string>>(() => getAllSiteContent())
    const [siteContentMessage, setSiteContentMessage] = useState("")

    const activePolicy = useMemo(() => {
        return POLICY_DEFINITIONS.find((item) => item.key === activeKey)
    }, [activeKey])

    const handleSave = () => {
        savePolicyContent(activeKey, draft[activeKey] || "")
        setMessage("Đã lưu chính sách thành công")
        setTimeout(() => setMessage(""), 1800)
    }

    const handleSaveSiteContent = () => {
        saveAllSiteContent(siteContentDraft)
        setSiteContentMessage("Đã lưu UI content thành công")
        setTimeout(() => setSiteContentMessage(""), 1800)
    }

    return (
        <div className="space-y-5">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">Quản lí chính sách</h1>
                <p className="mt-1 text-sm text-slate-600">Cập nhật nội dung chính sách hiển thị ở footer và trang công
                    khai.</p>
            </div>

            <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
                <aside className="rounded-2xl bg-white p-4 shadow-sm">
                    <div className="space-y-2">
                        {POLICY_DEFINITIONS.map((item) => (
                            <button
                                key={item.key}
                                type="button"
                                onClick={() => setActiveKey(item.key)}
                                className={`w-full rounded-xl px-3 py-2 text-left text-sm font-medium transition ${
                                    item.key === activeKey
                                        ? "bg-slate-900 text-white"
                                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                                }`}
                            >
                                {item.title}
                            </button>
                        ))}
                    </div>
                </aside>

                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-bold text-slate-900">{activePolicy?.title}</h2>
                    <p className="mt-1 text-sm text-slate-500">{activePolicy?.summary}</p>

                    <textarea
                        className="mt-4 min-h-[320px] w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none focus:border-slate-400"
                        value={draft[activeKey] || ""}
                        onChange={(event) => {
                            const value = event.target.value
                            setDraft((prev) => ({...prev, [activeKey]: value}))
                        }}
                    />

                    <div className="mt-4 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleSave}
                            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                        >
                            Lưu chính sách
                        </button>
                        {message ? <span className="text-sm font-medium text-emerald-600">{message}</span> : null}
                    </div>
                </section>
            </div>

            <section className="rounded-2xl bg-white p-5 shadow-sm">
                <h2 className="text-lg font-bold text-slate-900">UI content (Header + Home)</h2>
                <p className="mt-1 text-sm text-slate-500">
                    Chỉnh sửa các dòng text hiển thị ở header công khai và banner flash deal trang chủ.
                </p>

                <div className="mt-4 space-y-4">
                    {SITE_CONTENT_FIELDS.map((field) => (
                        <div key={field.key}>
                            <label className="block text-sm font-semibold text-slate-700">{field.label}</label>
                            <p className="mt-1 text-xs text-slate-500">{field.hint}</p>

                            {field.multiline ? (
                                <textarea
                                    className="mt-2 min-h-[96px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                                    value={siteContentDraft[field.key] || ""}
                                    onChange={(event) => {
                                        const value = event.target.value
                                        setSiteContentDraft((prev) => ({...prev, [field.key]: value}))
                                    }}
                                />
                            ) : (
                                <input
                                    className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
                                    value={siteContentDraft[field.key] || ""}
                                    onChange={(event) => {
                                        const value = event.target.value
                                        setSiteContentDraft((prev) => ({...prev, [field.key]: value}))
                                    }}
                                />
                            )}
                        </div>
                    ))}
                </div>

                <div className="mt-4 flex items-center gap-3">
                    <button
                        type="button"
                        onClick={handleSaveSiteContent}
                        className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
                    >
                        Lưu UI content
                    </button>
                    {siteContentMessage ?
                        <span className="text-sm font-medium text-emerald-600">{siteContentMessage}</span> : null}
                </div>
            </section>
        </div>
    )
}

