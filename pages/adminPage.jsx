import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import {
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineShoppingCart,
  HiOutlineStar,
  HiOutlineArrowLeft,
  HiOutlineSquares2X2,
  HiOutlineHome,
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

function SidebarLink({ to, label, Icon, end }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
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
  const user = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-100 overflow-hidden">
      <aside className="w-64 shrink-0 h-full bg-slate-900 text-white flex flex-col overflow-y-auto">
        <div className="px-6 py-6 border-b border-slate-700">
          <h2 className="text-lg font-bold tracking-wide flex items-center gap-2">
            <HiOutlineSquares2X2 className="w-5 h-5" />
            Admin Panel
          </h2>
          {user && (
            <p className="text-slate-400 text-sm mt-1">
              {user.firstName} {user.lastName}
            </p>
          )}
        </div>

        <nav className="flex flex-col gap-1 p-4 flex-1">
          {navItems.map((item) => (
            <SidebarLink key={item.to} {...item} />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <NavLink
            to="/"
            className="flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-white transition"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back to Store
          </NavLink>
        </div>
      </aside>

      <main className="flex-1 min-h-0 overflow-y-auto">
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
