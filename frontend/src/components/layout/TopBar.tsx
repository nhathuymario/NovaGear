import {Link} from "react-router-dom"
import {MapPin, Phone} from "lucide-react"
import {getSiteContent} from "../../utils/siteContent"

export default function TopBar() {
    const topText = getSiteContent("headerTopText")
    const hotlineText = getSiteContent("headerHotlineText")

    return (
        <div className="border-b border-slate-200/60 bg-white">
            <div className="mx-auto flex max-w-[1320px] items-center justify-between px-4 py-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-brand-blue" />
                        <span>{topText}</span>
                    </span>
                </div>
                <div className="hidden items-center gap-4 md:flex">
                    <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-brand-red" />
                        <span className="font-semibold">{hotlineText}</span>
                    </span>
                    <span className="text-slate-300">|</span>
                    <Link to="/orders" className="transition hover:text-brand-blue">
                        Tra cứu đơn hàng
                    </Link>
                    <span className="text-slate-300">|</span>
                    <Link to="/policies/bao-hanh" className="transition hover:text-brand-blue">
                        Bảo hành
                    </Link>
                </div>
            </div>
        </div>
    )
}
