import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
    plugins: [react(), tailwindcss()],
    assetsInclude: ["**/*.glb"],
    server: {
        proxy: {
            "/api-upload": {
                target: "http://localhost:8083",
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api-upload/, "/api"),
            },
            "/api/uploads": {
                target: "http://localhost:8083",
                changeOrigin: true,
            },
            "/api": {
                target: "http://localhost:8089",
                changeOrigin: true,
            },
            "/uploads": {
                target: "http://localhost:8089",
                changeOrigin: true,
            },
        },
    },
})

