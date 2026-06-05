import { useEffect, useState } from "react";
import { NavLink, Routes, Route, Navigate, useLocation } from "react-router-dom";
import {
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineShoppingCart,
  HiOutlineStar,
  HiOutlineArrowLeft,
  HiOutlineSquares2X2,
  HiOutlineHome,
  HiOutlineBars3,
  HiOutlineXMark,
} from "react-icons/hi2";
import AdminDashboard from "./admin/adminDashboard";
import AdminProduct from "./admin/adminProduct";
import AddProduct from "./admin/addProduct";
import EditProduct from "./admin/editProduct";
import AdminUsers from "./admin/adminUsers";
import AdminOrders from "./admin/adminOrders";
import AdminReviews from "./admin/adminReviews";

const navItems = [
  { to: "/admin", label: "Dashboard", Icon: HiOutlineHome, end: true },
  { to: "/admin/products", label: "Products", Icon: HiOutlineCube },
  { to: "/admin/users", label: "Users", Icon: HiOutlineUsers },
  { to: "/admin/orders", label: "Orders", Icon: HiOutlineShoppingCart },
  { to: "/admin/reviews", label: "Reviews", Icon: HiOutlineStar },
];

function SidebarLink({ to, label, Icon, end, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition min-h-11 ${
          isActive
            ? "bg-blue-600 text-white shadow-sm"
            : "text-slate-300 hover:bg-slate-800 hover:text-white"
        }`
      }
    >
      <Icon className="w-5 h-5 shrink-0" />
      {label}
    </NavLink>
  );
}

export default function AdminPage() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const closeSidebar = () => setSidebarOpen(false);

  const sidebarContent = (
    <>
      <div className="px-5 py-5 border-b border-slate-700">
        <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
          <HiOutlineSquares2X2 className="w-5 h-5 shrink-0" />
          Admin Panel
        </h2>
        {user && (
          <p className="text-slate-400 text-sm mt-1 truncate">
            {user.firstName} {user.lastName}
          </p>
        )}
      </div>

      <nav className="flex flex-col gap-1 p-4 flex-1">
        {navItems.map((item) => (
          <SidebarLink key={item.to} {...item} onNavigate={closeSidebar} />
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <NavLink
          to="/"
          onClick={closeSidebar}
          className="flex items-center gap-2 px-4 py-3 text-sm text-slate-400 hover:text-white transition min-h-11"
        >
          <HiOutlineArrowLeft className="w-4 h-4 shrink-0" />
          Back to Store
        </NavLink>
      </div>
    </>
  );

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100dvh-4rem)] bg-base-200 min-w-0">
      <div className="lg:hidden sticky top-16 z-30 flex items-center justify-between gap-3 px-4 py-3 bg-slate-900 text-white border-b border-slate-700">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-slate-800 transition"
          aria-label="Open admin menu"
        >
          <HiOutlineBars3 className="w-6 h-6" />
        </button>
        <span className="font-semibold text-sm truncate">Admin Panel</span>
        <div className="w-10" aria-hidden />
      </div>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 top-16 z-40 bg-black/50 lg:hidden"
          aria-label="Close admin menu"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed top-16 left-0 z-50 h-[calc(100dvh-4rem)] w-64 max-w-[85vw] bg-slate-900 text-white flex flex-col overflow-y-auto transition-transform duration-300 ease-out lg:static lg:translate-x-0 lg:shrink-0 lg:max-w-none lg:pointer-events-auto ${
          sidebarOpen ? "translate-x-0 pointer-events-auto" : "-translate-x-full pointer-events-none"
        }`}
        aria-hidden={!sidebarOpen}
      >
        <div className="lg:hidden flex justify-end p-3 border-b border-slate-700">
          <button
            type="button"
            onClick={closeSidebar}
            className="p-2 rounded-lg hover:bg-slate-800 transition"
            aria-label="Close admin menu"
          >
            <HiOutlineXMark className="w-6 h-6" />
          </button>
        </div>
        {sidebarContent}
      </aside>

      <main className="flex-1 min-w-0 min-h-0 overflow-x-hidden">
        <Routes>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProduct />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:productId" element={<EditProduct />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  );
}
