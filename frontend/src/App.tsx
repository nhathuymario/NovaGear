import {Route, Routes} from "react-router-dom"
import MainLayout from "./components/layout/MainLayout"
import ProtectedRoute from "./components/auth/ProtectedRoute"

import HomePage from "./pages/HomePage"
import ProductListPage from "./pages/ProductListPage"
import ProductDetailPage from "./pages/ProductDetailPage"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import CartPage from "./pages/CartPage"
import CheckoutPage from "./pages/CheckoutPage"
import OrdersPage from "./pages/OrdersPage"
import OrderDetailPage from "./pages/OrderDetailPage"
import PaymentPage from "./pages/PaymentPage"
import PaymentResultPage from "./pages/PaymentResultPage"
import ProfilePage from "./pages/ProfilePage"
import NotFoundPage from "./pages/NotFoundPage"
import AdminRoute from "./components/admin/AdminRoute"
import AdminLayout from "./components/admin/AdminLayout"
import AdminDashboardPage from "./pages/admin/AdminDashboardPage"
import AdminInventoryPage from "./pages/admin/AdminInventoryPage"
import AdminProductsPage from "./pages/admin/AdminProductsPage"
import AdminOrdersPage from "./pages/admin/AdminOrdersPage"
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage"


export default function App() {
    return (
        <Routes>
            <Route element={<MainLayout/>}>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/products" element={<ProductListPage/>}/>
                <Route path="/products/:slug" element={<ProductDetailPage/>}/>

                <Route path="/login" element={<LoginPage/>}/>
                <Route path="/register" element={<RegisterPage/>}/>

                <Route element={<AdminRoute/>}>
                    <Route path="/admin" element={<AdminLayout/>}>
                        <Route index element={<AdminDashboardPage/>}/>
                        <Route path="products" element={<AdminProductsPage/>}/>
                        <Route path="categories" element={<AdminCategoriesPage/>}/>
                        <Route path="orders" element={<AdminOrdersPage/>}/>
                        <Route path="inventory" element={<AdminInventoryPage/>}/>
                    </Route>
                </Route>

                <Route path="*" element={<NotFoundPage/>}/>
                <Route element={<ProtectedRoute/>}>
                    <Route path="/profile" element={<ProfilePage/>}/>
                    <Route path="/cart" element={<CartPage/>}/>
                    <Route path="/checkout" element={<CheckoutPage/>}/>
                    <Route path="/orders" element={<OrdersPage/>}/>
                    <Route path="/orders/:id" element={<OrderDetailPage/>}/>
                    <Route path="/payment/:orderId" element={<PaymentPage/>}/>
                    <Route path="/payment/result" element={<PaymentResultPage/>}/>
                </Route>
            </Route>
        </Routes>
    )
}