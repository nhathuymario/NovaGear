import {AnimatePresence, motion} from "framer-motion"
import {Outlet, useLocation} from "react-router-dom"
import Header from "./Header"
import Footer from "./Footer"
import AiChatWidget from "../ai/AiChatWidget"

export default function MainLayout() {
    const location = useLocation()

    return (
        <div className="min-h-screen bg-brand-bg">
            <Header />
            <main className="mx-auto max-w-[1320px] px-4 py-5 md:py-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{opacity: 0, y: 12}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -8}}
                        transition={{duration: 0.22, ease: "easeOut"}}
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
            <Footer />
            <AiChatWidget />
        </div>
    )
}