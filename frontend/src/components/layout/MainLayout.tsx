import { Outlet } from "react-router-dom"
import Header from "./Header"
import Footer from "./Footer"

export default function MainLayout() {
    return (
        <div className="min-h-screen bg-brand-light">
            <Header />
            <main className="mx-auto max-w-7xl px-4 py-4">
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}