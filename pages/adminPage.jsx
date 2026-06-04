import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import {
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineShoppingCart,
  HiOutlineStar,
  HiOutlineArrowLeft,
  HiOutlineSquares2X2,
} from "react-icons/hi2";
import AdminProduct from "./admin/adminProduct";
import AddProduct from "./admin/addProduct";
import EditProduct from "./admin/editProduct";

const navItems = [
  { to: "/admin/products", label: "Products", Icon: HiOutlineCube },
  { to: "/admin/users",    label: "Users",    Icon: HiOutlineUsers },
  { to: "/admin/orders",   label: "Orders",   Icon: HiOutlineShoppingCart },
  { to: "/admin/reviews",  label: "Reviews",  Icon: HiOutlineStar },
];

function SidebarLink({ to, label, Icon }) {
  return (
    <NavLink
      to={to}
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

function PlaceholderPage({ title }) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
      <p className="text-slate-500 mt-2">This section is coming soon.</p>
    </div>
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
          <Route index element={<Navigate to="products" replace />} />
          <Route path="products" element={<AdminProduct />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="products/edit/:productId" element={<EditProduct />} />
          <Route path="users"    element={<PlaceholderPage title="Users" />} />
          <Route path="orders"   element={<PlaceholderPage title="Orders" />} />
          <Route path="reviews"  element={<PlaceholderPage title="Reviews" />} />
        </Routes>
      </main>
    </div>
  );
}
