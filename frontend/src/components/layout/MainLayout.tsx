import {AnimatePresence, motion} from "framer-motion"
import {Outlet, useLocation} from "react-router-dom"
import Header from "./Header"
import Footer from "./Footer"
import AiChatWidget from "../ai/AiChatWidget"

export default function MainLayout() {
    const location = useLocation()

    return (
        <div className="min-h-screen bg-brand-bg bg-[radial-gradient(circle_at_top,rgba(255,212,0,0.18),transparent_28%),radial-gradient(circle_at_right_top,rgba(29,78,216,0.12),transparent_24%)]">
            <Header />
            <main className="mx-auto max-w-[1320px] px-4 py-6 md:px-5 md:py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{opacity: 0, y: 16, filter: "blur(8px)"}}
                        animate={{opacity: 1, y: 0, filter: "blur(0px)"}}
                        exit={{opacity: 0, y: -12, filter: "blur(8px)"}}
                        transition={{duration: 0.28, ease: "easeOut"}}
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