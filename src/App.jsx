import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Header from '../components/header'
import HomePage from '../pages/home'
import LoginPage from '../pages/loginPage'
import NotFoundPage from '../pages/notFoundPage'
import AdminPage from '../pages/adminPage'
import RegisterPage from '../pages/registerPage'
import TestingPage from '../pages/testingPage'

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

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/"        element={<HomePage />} />
        <Route path="/testing"        element={<TestingPage />} />
        <Route path="/login"   element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        <Route
          path="/admin/*"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App