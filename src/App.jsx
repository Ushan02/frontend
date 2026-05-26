import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './App.css'
import Header from '../components/header'
import HomePage from '../pages/home'
import LoginPage from '../pages/loginPage'
import NotFoundPage from '../pages/notFoundPage'
import AdminPage from '../pages/adminPage'

// Protect admin routes — redirect to login if no token or not admin
function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const raw = localStorage.getItem("user");
  const user = raw ? JSON.parse(raw) : null;

  if (!token || !user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/"       element={<HomePage />} />
        <Route path="/login"  element={<LoginPage />} />
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
