/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                brand: {
                    yellow: "#facc15",
                    dark: "#111827",
                    gray: "#6b7280",
                    light: "#f3f4f6",
                    red: "#ef4444",
                },
            },
        },
    },
    plugins: [],
}