import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineShoppingCart,
  HiOutlineStar,
  HiOutlineChatBubbleLeftRight,
  HiOutlineWrenchScrewdriver,
} from "react-icons/hi2";
import { API_BASE, getAuthHeaders } from "../../src/lib/adminApi";
import {
  ADMIN_NOTIFICATIONS_EVENT,
  fetchAdminUnreadCounts,
} from "../../src/lib/adminNotifications";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, users: 0, orders: 0, repairs: 0, reviews: 0, messages: 0 });
  const [unread, setUnread] = useState({ unreadMessages: 0, unreadReviews: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const headers = getAuthHeaders();
      try {
        const [products, users, orders, repairs, reviews, messages, unreadCounts] = await Promise.all([
          axios.get(`${API_BASE}/api/products`, { headers }),
          axios.get(`${API_BASE}/api/users`, { headers }),
          axios.get(`${API_BASE}/api/order`, { headers }),
          axios.get(`${API_BASE}/api/repairs`, { headers }),
          axios.get(`${API_BASE}/api/review`, { headers }),
          axios.get(`${API_BASE}/api/contact`, { headers }),
          fetchAdminUnreadCounts(),
        ]);
        setStats({
          products: products.data?.length ?? 0,
          users: users.data?.length ?? 0,
          orders: orders.data?.length ?? 0,
          repairs: repairs.data?.length ?? 0,
          reviews: reviews.data?.length ?? 0,
          messages: messages.data?.length ?? 0,
        });
        setUnread(unreadCounts);
      } catch {
        /* keep zeros */
      } finally {
        setLoading(false);
      }
    }
    load();

    const refreshUnread = () => fetchAdminUnreadCounts().then(setUnread);
    window.addEventListener(ADMIN_NOTIFICATIONS_EVENT, refreshUnread);
    return () => window.removeEventListener(ADMIN_NOTIFICATIONS_EVENT, refreshUnread);
  }, []);

  const cards = [
    { label: "Products", count: stats.products, to: "/admin/products", Icon: HiOutlineCube, color: "bg-blue-500", unread: 0 },
    { label: "Users", count: stats.users, to: "/admin/users", Icon: HiOutlineUsers, color: "bg-emerald-500", unread: 0 },
    { label: "Orders", count: stats.orders, to: "/admin/orders", Icon: HiOutlineShoppingCart, color: "bg-amber-500", unread: 0 },
    { label: "Repairs", count: stats.repairs, to: "/admin/repairs", Icon: HiOutlineWrenchScrewdriver, color: "bg-cyan-600", unread: 0 },
    { label: "Reviews", count: stats.reviews, to: "/admin/reviews", Icon: HiOutlineStar, color: "bg-purple-500", unread: unread.unreadReviews },
    { label: "Messages", count: stats.messages, to: "/admin/messages", Icon: HiOutlineChatBubbleLeftRight, color: "bg-rose-500", unread: unread.unreadMessages },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
      <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-2">Dashboard</h1>
      <p className="text-slate-500 text-sm mb-6 sm:mb-8">Overview of your store</p>

      {loading ? (
        <div className="text-slate-400 text-sm">Loading stats…</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4 sm:gap-6">
          {cards.map(({ label, count, to, Icon, color, unread: unreadCount }) => (
            <Link
              key={label}
              to={to}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition group relative"
            >
              <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center text-white mb-4 relative`}>
                <Icon className="w-6 h-6" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[1.25rem] h-5 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
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
