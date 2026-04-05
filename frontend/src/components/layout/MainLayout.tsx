import { Outlet } from "react-router-dom"
import Header from "./Header"
import Footer from "./Footer"

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-brand-bg">
            <Header />
            <main className="mx-auto max-w-[1280px] px-4 py-6 md:px-5 md:py-8">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}