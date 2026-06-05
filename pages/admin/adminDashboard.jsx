import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineShoppingCart,
  HiOutlineStar,
} from "react-icons/hi2";
import { API_BASE, getAuthHeaders } from "../../src/lib/adminApi";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, users: 0, orders: 0, reviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const headers = getAuthHeaders();
      try {
        const [products, users, orders, reviews] = await Promise.all([
          axios.get(`${API_BASE}/api/products`, { headers }),
          axios.get(`${API_BASE}/api/users`, { headers }),
          axios.get(`${API_BASE}/api/order`, { headers }),
          axios.get(`${API_BASE}/api/review`, { headers }),
        ]);
        setStats({
          products: products.data?.length ?? 0,
          users: users.data?.length ?? 0,
          orders: orders.data?.length ?? 0,
          reviews: reviews.data?.length ?? 0,
        });
      } catch {
        /* keep zeros */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const cards = [
    { label: "Products", count: stats.products, to: "/admin/products", Icon: HiOutlineCube, color: "bg-blue-500" },
    { label: "Users", count: stats.users, to: "/admin/users", Icon: HiOutlineUsers, color: "bg-emerald-500" },
    { label: "Orders", count: stats.orders, to: "/admin/orders", Icon: HiOutlineShoppingCart, color: "bg-amber-500" },
    { label: "Reviews", count: stats.reviews, to: "/admin/reviews", Icon: HiOutlineStar, color: "bg-purple-500" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Dashboard</h1>
      <p className="text-slate-500 text-sm mb-6 sm:mb-8">Overview of your store</p>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading stats…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          {cards.map(({ label, count, to, Icon, color }) => (
            <Link
              key={label}
              to={to}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition group"
            >
              <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-white mb-4`}>
                <Icon className="w-6 h-6" />
              </div>
              <p className="text-3xl font-bold text-slate-800">{count}</p>
              <p className="text-sm text-slate-500 group-hover:text-blue-600 transition">{label}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
