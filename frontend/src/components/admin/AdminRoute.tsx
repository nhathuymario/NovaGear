import { Navigate, Outlet } from "react-router-dom"
import { getStoredUser, normalizeRole } from "../../utils/auth"

export default function AdminRoute() {
    const user = getStoredUser()

    if (!user || normalizeRole(user.role) !== "ADMIN") {
        return <Navigate to="/login" replace />
    }

    return <Outlet />
}
