import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineClipboardDocumentList,
  HiOutlineShoppingBag,
  HiOutlineFunnel,
} from "react-icons/hi2";
import CustomerOrderCard from "../components/CustomerOrderCard";
import { getAuthHeaders } from "../src/lib/adminApi";

const ORDER_API = import.meta.env.VITE_BACKEND_URL + "/api/order/my-orders";

const FILTERS = [
  { key: "all", label: "All orders" },
  { key: "active", label: "In progress" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

function matchesFilter(order, filter) {
  if (filter === "all") return true;
  if (filter === "delivered") return order.status === "delivered";
  if (filter === "cancelled") return order.status === "cancelled" || order.paymentStatus === "cancelled";
  if (filter === "active") {
    return order.status !== "delivered" && order.status !== "cancelled" && order.paymentStatus !== "cancelled";
  }
  return true;
}

export default function PurchaseHistoryPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    async function loadOrders() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(ORDER_API, { headers: getAuthHeaders() });
        if (!cancelled) {
          setOrders(Array.isArray(res.data) ? res.data : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load your purchase history.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadOrders();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredOrders = useMemo(
    () => orders.filter((order) => matchesFilter(order, filter)),
    [orders, filter]
  );

  const handleOrderUpdated = (updated) => {
    setOrders((prev) => prev.map((o) => (o.orderId === updated.orderId ? updated : o)));
  };

  return (
    <div className="page-shell flex-1 min-w-0">
      <div className="page-container max-w-4xl py-6 sm:py-10 w-full">
        <div className="mb-6 sm:mb-8">
          <span className="section-eyebrow mb-3">
            <HiOutlineClipboardDocumentList className="w-3.5 h-3.5" />
            Your account
          </span>
          <h1 className="section-title flex items-center gap-2">
            <HiOutlineClipboardDocumentList className="w-8 h-8 text-primary shrink-0" />
            My Orders
          </h1>
          <p className="section-subtitle mt-2 max-w-xl">
            View your purchase history, track delivery status, and see warranty details for every product you bought.
          </p>
        </div>

        {!loading && !error && orders.length > 0 && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm text-base-content/50 flex items-center gap-1 mr-1">
              <HiOutlineFunnel className="w-4 h-4" />
              Filter
            </span>
            {FILTERS.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setFilter(item.key)}
                className={`pill-tab px-4 py-2 text-sm ${
                  filter === item.key ? "pill-tab-active" : ""
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <span className="loading loading-spinner loading-lg text-primary" />
            <p className="text-base-content/60 mt-4 text-sm">Loading your orders…</p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-error/20 bg-error/5 p-6 text-center">
            <p className="text-error font-medium">{error}</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="card-bg rounded-3xl border border-base-300/50 p-10 sm:p-14 text-center">
            <HiOutlineShoppingBag className="w-16 h-16 mx-auto text-base-content/20 mb-4" />
            <h2 className="text-xl font-bold text-base-content">No purchases yet</h2>
            <p className="text-base-content/60 mt-2 max-w-md mx-auto">
              When you place an order, it will appear here with full product details and warranty information.
            </p>
            <Link to="/products" className="btn btn-primary rounded-xl mt-6 gap-2">
              <HiOutlineShoppingBag className="w-5 h-5" />
              Start shopping
            </Link>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card-bg rounded-2xl border border-base-300/50 p-8 text-center">
            <p className="text-base-content/60">No orders match this filter.</p>
            <button
              type="button"
              onClick={() => setFilter("all")}
              className="btn btn-ghost btn-sm mt-3 text-primary"
            >
              Show all orders
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-base-content/60">
              {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
            </p>
            {filteredOrders.map((order) => (
              <CustomerOrderCard
                key={order.orderId}
                order={order}
                onOrderUpdated={handleOrderUpdated}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
