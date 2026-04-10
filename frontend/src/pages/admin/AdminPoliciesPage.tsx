import {useMemo, useState} from "react"
import {POLICY_DEFINITIONS, type PolicyKey, getPolicyContent, savePolicyContent} from "../../utils/policies"

export default function AdminPoliciesPage() {
    const [activeKey, setActiveKey] = useState<PolicyKey>("warranty")
    const [draft, setDraft] = useState<Record<PolicyKey, string>>(() => ({
        warranty: getPolicyContent("warranty"),
        shipping: getPolicyContent("shipping"),
        payment: getPolicyContent("payment"),
        support: getPolicyContent("support"),
    }))
    const [message, setMessage] = useState("")

    const activePolicy = useMemo(() => {
        return POLICY_DEFINITIONS.find((item) => item.key === activeKey)
    }, [activeKey])

    const handleSave = () => {
        savePolicyContent(activeKey, draft[activeKey] || "")
        setMessage("Da luu chinh sach thanh cong")
        setTimeout(() => setMessage(""), 1800)
    }

    return (
        <div className="space-y-5">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">Quan ly chinh sach</h1>
                <p className="mt-1 text-sm text-slate-600">Cap nhat noi dung chinh sach hien thi o footer va trang cong khai.</p>
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
                            Luu chinh sach
                        </button>
                        {message ? <span className="text-sm font-medium text-emerald-600">{message}</span> : null}
                    </div>
                </section>
            </div>
        </div>
    )
}

