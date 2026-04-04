import { Navigate, Outlet } from "react-router-dom"
import { getStoredUser, getToken } from "../../utils/auth"

export default function AdminRoute() {
    const token = getToken()
    const user = getStoredUser()

    const role = String(user?.role || "").toUpperCase()

    if (!token) {
        return <Navigate to="/login" replace />
    }

    if (role !== "ADMIN" && role !== "ROLE_ADMIN") {
        return <Navigate to="/" replace />
    }

    return <Outlet />
}