import { Fragment, useEffect, useState } from "react";
import axios from "axios";
import { HiOutlineChevronDown, HiOutlineChevronUp } from "react-icons/hi2";
import { API_BASE, getAuthHeaders } from "../../src/lib/adminApi";
import { formatPrice } from "../../src/lib/formatPrice";

const API = API_BASE + "/api/order";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

function PaymentBadge({ method, paymentStatus }) {
  const labels = {
    pending_cod: "COD — pending",
    awaiting_payment: "Awaiting payment",
    paid: "Paid online",
    failed: "Payment failed",
    cancelled: "Cancelled",
  };
  const colors = {
    pending_cod: "bg-amber-100 text-amber-800",
    awaiting_payment: "bg-orange-100 text-orange-800",
    paid: "bg-emerald-100 text-emerald-800",
    failed: "bg-red-100 text-red-800",
    cancelled: "bg-slate-100 text-slate-700",
  };
  const key = paymentStatus || (method === "cod" ? "pending_cod" : "awaiting_payment");
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[key] || "bg-slate-100"}`}>
      {labels[key] || key}
    </span>
  );
}

function StatusBadge({ status }) {
  const colors = {
    pending: "bg-amber-100 text-amber-800",
    processing: "bg-blue-100 text-blue-800",
    shipped: "bg-indigo-100 text-indigo-800",
    delivered: "bg-green-100 text-green-800",
    cancelled: "bg-red-100 text-red-800",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${colors[status] || "bg-slate-100"}`}>
      {status}
    </span>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(API, { headers: getAuthHeaders() });
      setOrders(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateStatus = async (orderId, status) => {
    try {
      const res = await axios.patch(
        `${API}/${orderId}/status`,
        { status },
        { headers: getAuthHeaders() }
      );
      setOrders((prev) =>
        prev.map((o) => (o.orderId === orderId ? res.data.order : o))
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    }
  };

  const formatDate = (d) => {
    if (!d) return "—";
    return new Date(d).toLocaleString();
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Orders</h1>
        <p className="text-slate-500 text-sm mt-1">View and update customer orders</p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex justify-between">
          <span>{error}</span>
          <button onClick={fetchOrders} className="underline">Retry</button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-sm">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-sm">No orders yet.</div>
        ) : (
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase w-8" />
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Order ID</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Customer</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Total</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Payment</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Date</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => (
                <Fragment key={order.orderId}>
                  <tr className="hover:bg-slate-50">
                    <td className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded(expanded === order.orderId ? null : order.orderId)
                        }
                        className="btn btn-ghost btn-xs btn-square"
                      >
                        {expanded === order.orderId ? (
                          <HiOutlineChevronUp className="w-4 h-4" />
                        ) : (
                          <HiOutlineChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-mono text-slate-600">
                      {order.orderId}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-slate-800">{order.name}</p>
                      <p className="text-xs text-slate-500">{order.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-sm font-bold text-slate-800">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-5 py-3.5">
                      <PaymentBadge method={order.paymentMethod} paymentStatus={order.paymentStatus} />
                    </td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-500">
                      {formatDate(order.date)}
                    </td>
                    <td className="px-5 py-3.5">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.orderId, e.target.value)}
                        className="select select-bordered select-sm"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {expanded === order.orderId && (
                    <tr>
                      <td colSpan={8} className="px-5 py-4 bg-slate-50">
                        <div className="grid sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium text-slate-700 mb-1">Delivery</p>
                            <p className="text-slate-600">Phone: {order.phone}</p>
                            <p className="text-slate-600">{order.address}</p>
                            <p className="text-slate-600 mt-2 capitalize">
                              Payment: {order.paymentMethod || "cod"} — {order.paymentStatus || "pending_cod"}
                            </p>
                          </div>
                          <div>
                            <p className="font-medium text-slate-700 mb-2">Items</p>
                            <ul className="space-y-1">
                              {order.products?.map((line, i) => (
                                <li key={i} className="text-slate-600">
                                  {line.productinfo?.productName} × {line.quantity} —{" "}
                                  {formatPrice(line.productinfo?.price * line.quantity)}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && orders.length > 0 && (
        <p className="text-sm text-slate-400 mt-4">{orders.length} orders</p>
      )}
    </div>
  );
}
