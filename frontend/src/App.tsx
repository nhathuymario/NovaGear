import { Routes, Route } from "react-router-dom"
import MainLayout from "./components/layout/MainLayout"
import HomePage from "./pages/HomePage"
import ProductListPage from "./pages/ProductListPage"
import ProductDetailPage from "./pages/ProductDetailPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import CartPage from "./pages/CartPage"
import CheckoutPage from "./pages/CheckoutPage"
import OrdersPage from "./pages/OrdersPage"
import OrderDetailPage from "./pages/OrderDetailPage"

// --- Import thêm các trang thanh toán ---
import PaymentPage from "./pages/PaymentPage"
import PaymentResultPage from "./pages/PaymentResultPage"

export default function App() {
    return (
        <Routes>
            {/* Các trang nằm trong MainLayout (Có Header, Footer) */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/orders/:id" element={<OrderDetailPage />} />

                {/* Các Route thanh toán mới thêm */}
                <Route path="/payment/:orderId" element={<PaymentPage />} />
                <Route path="/payment/result" element={<PaymentResultPage />} />
            </Route>

            {/* Các trang đứng độc lập (Thường là trang trắng chỉ có Form) */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
        </Routes>
    )
}