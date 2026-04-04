import {Navigate, Outlet} from "react-router-dom"
import {getStoredUser} from "../../utils/auth"

export default function AdminRoute() {
    const user = getStoredUser()

    // Nếu không phải ADMIN thì đá văng ra trang chủ hoặc trang login
    if (!user || user.role !== "ADMIN") {
        return <Navigate to="/login" replace/>
    }

    // Nếu đúng là ADMIN thì cho phép đi tiếp vào các trang con (Dashboard, Products...)
    return <Outlet/>
}