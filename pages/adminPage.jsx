import { NavLink, Routes, Route, Navigate } from "react-router-dom";
import AdminProduct from "./admin/adminProduct";
import AddProduct from "./admin/addProduct";

const navItems = [
  { to: "/admin/products", label: "Products", icon: "📦" },
  { to: "/admin/users",    label: "Users",    icon: "👥" },
  { to: "/admin/orders",   label: "Orders",   icon: "🛒" },
  { to: "/admin/reviews",  label: "Reviews",  icon: "⭐" },
];

function SidebarLink({ to, label, icon }) {
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
      <span className="text-lg">{icon}</span>
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
    <div className="flex min-h-[calc(100vh-4rem)] bg-slate-100">
      <aside className="w-64 shrink-0 bg-slate-900 text-white flex flex-col">
        <div className="px-6 py-6 border-b border-slate-700">
          <h2 className="text-lg font-bold tracking-wide">Admin Panel</h2>
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
            ← Back to Store
          </NavLink>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <Routes>
          <Route index element={<Navigate to="products" replace />} />
          <Route path="products" element={<AdminProduct />} />
          <Route path="products/add" element={<AddProduct />} />
          <Route path="users"    element={<PlaceholderPage title="Users" />} />
          <Route path="orders"   element={<PlaceholderPage title="Orders" />} />
          <Route path="reviews"  element={<PlaceholderPage title="Reviews" />} />
        </Routes>
      </main>
    </div>
  );
}
