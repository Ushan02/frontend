import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import './App.css'
import Header from '../components/header'
import Footer from '../components/footer'
import ScrollToTop from '../components/ScrollToTop'
import HomePage from '../pages/home'
import LoginPage from '../pages/loginPage'
import NotFoundPage from '../pages/notFoundPage'
import AdminPage from '../pages/adminPage'
import RegisterPage from '../pages/registerPage'
import ForgotPasswordPage from '../pages/forgotPasswordPage'
import ProductsPage from '../pages/productsPage'
import ProductDetailPage from '../pages/productDetailPage'
import CartPage from '../pages/cartPage'
import CheckoutPage from '../pages/checkoutPage'
import AboutUsPage from '../pages/aboutUsPage'
import { CartProvider } from './context/CartContext'

// Safely parse stored user
function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw && raw !== "undefined" ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Protect admin routes — redirect to /login if not authenticated, or / if not admin
function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const user  = getStoredUser();

  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

// Redirect already-logged-in users away from login/register
function GuestRoute({ children }) {
  const token = localStorage.getItem("token");
  const user  = getStoredUser();

  if (token && user) {
    return user.role === "admin"
      ? <Navigate to="/admin" replace />
      : <Navigate to="/"     replace />;
  }
  return children;
}

function PageLayout() {
  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 overflow-x-hidden">
      <main className="flex-1 flex flex-col min-h-0 min-w-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <CartProvider>
      <div className="min-h-screen flex flex-col min-w-0 overflow-x-hidden bg-white">
        <Header />
        <div className="flex-1 flex flex-col min-w-0 pt-16">
        <Routes>
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <div className="h-[calc(100dvh-4rem)] min-h-0 flex flex-col overflow-hidden">
                  <AdminPage />
                </div>
              </AdminRoute>
            }
          />
          <Route element={<PageLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutUsPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/products/:productId" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
            <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
            <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        </div>
      </div>
      </CartProvider>
    </BrowserRouter>
  )
}

export default App