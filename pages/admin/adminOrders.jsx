import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { HiOutlinePlus, HiOutlineChevronLeft, HiOutlineChevronRight } from "react-icons/hi2";
import AdminAddOrderModal from "../../components/AdminAddOrderModal";
import OrderDetailModal from "../../components/OrderDetailModal";
import OrderDateCalendar from "../../components/OrderDateCalendar";
import { API_BASE, getAuthHeaders } from "../../src/lib/adminApi";
import { formatPrice } from "../../src/lib/formatPrice";
import {
  countOrdersByDate,
  filterOrdersByDate,
  formatDateKeyLabel,
  formatOrderTime,
  shiftDateKey,
  todayDateKey,
} from "../../src/lib/orderDates";

const API = API_BASE + "/api/order";

const STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

function PaymentBadge({ method, paymentStatus }) {
  const labels = {
    pending_cod: "COD — pending",
    pending_pos: "POS card — pending",
    awaiting_payment: "Awaiting payment",
    paid: "Payment successful",
    partial_paid: "Card paid — cash pending",
    failed: "Payment failed",
    cancelled: "Cancelled",
  };
  const colors = {
    pending_cod: "bg-amber-100 text-amber-800",
    pending_pos: "bg-orange-100 text-orange-800",
    awaiting_payment: "bg-orange-100 text-orange-800",
    partial_paid: "bg-sky-100 text-sky-800",
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
      {status === "delivered" ? "Done" : status}
    </span>
  );
}

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [addOrderOpen, setAddOrderOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(todayDateKey());

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

  const orderCountByDate = useMemo(() => countOrdersByDate(orders), [orders]);

  const dayOrders = useMemo(
    () =>
      filterOrdersByDate(orders, selectedDate).sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      ),
    [orders, selectedDate]
  );

  const dayTotal = useMemo(
    () => dayOrders.reduce((sum, o) => sum + Number(o.total || 0), 0),
    [dayOrders]
  );

  const isToday = selectedDate === todayDateKey();

  const handleOrderUpdated = (updated) => {
    setOrders((prev) => prev.map((o) => (o.orderId === updated.orderId ? updated : o)));
    setSelectedOrder(updated);
  };

  const updateStatus = async (orderId, status) => {
    try {
      const res = await axios.patch(
        `${API}/${orderId}/status`,
        { status },
        { headers: getAuthHeaders() }
      );
      const updated = res.data.order;
      setOrders((prev) => prev.map((o) => (o.orderId === orderId ? updated : o)));
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder(updated);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update status.");
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 min-w-0">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">Orders</h1>
          <p className="text-slate-500 text-sm mt-1">
            View orders by day — use the calendar to check previous dates
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAddOrderOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#0077b6] hover:bg-[#03045e] text-white text-sm font-semibold"
        >
          <HiOutlinePlus className="w-5 h-5" />
          Add Order
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex justify-between">
          <span>{error}</span>
          <button onClick={fetchOrders} className="underline">Retry</button>
        </div>
      )}

      <div className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {isToday ? "Today's orders" : formatDateKeyLabel(selectedDate)}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {dayOrders.length} order{dayOrders.length !== 1 ? "s" : ""}
                {dayOrders.length > 0 && (
                  <span> · Total {formatPrice(dayTotal)}</span>
                )}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedDate((d) => shiftDateKey(d, -1))}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
                aria-label="Previous day"
              >
                <HiOutlineChevronLeft className="w-5 h-5" />
              </button>
              <OrderDateCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                orderCountByDate={orderCountByDate}
              />
              <button
                type="button"
                onClick={() => setSelectedDate(todayDateKey())}
                className={`px-3 py-2 rounded-lg text-sm font-semibold border ${
                  isToday
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                    : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                }`}
              >
                Today
              </button>
              <button
                type="button"
                onClick={() => setSelectedDate((d) => shiftDateKey(d, 1))}
                disabled={isToday}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Next day"
              >
                <HiOutlineChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
            {loading ? (
              <div className="py-16 text-center text-slate-400 text-sm">Loading orders…</div>
            ) : dayOrders.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-sm px-4">
                No orders on {formatDateKeyLabel(selectedDate, { weekday: undefined })}.
                <br />
                <span className="text-slate-400">Pick another date on the calendar.</span>
              </div>
            ) : (
              <table className="w-full text-left min-w-[900px]">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                  <tr>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase">Order ID</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase">Customer</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase">Total</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase">Payment</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase">Status</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase">Time</th>
                    <th className="px-5 py-3.5 text-xs font-semibold uppercase">Update</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dayOrders.map((order) => (
                    <tr
                      key={order.orderId}
                      onClick={() => setSelectedOrder(order)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
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
                      <td className="px-5 py-3.5 text-sm text-slate-500 tabular-nums">
                        {formatOrderTime(order.date)}
                      </td>
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order.orderId, e.target.value)}
                          className="select select-bordered select-sm"
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s === "delivered" ? "Done" : s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

        {!loading && orders.length > 0 && (
          <p className="text-sm text-slate-400 mt-4">
            {orders.length} total orders · {Object.keys(orderCountByDate).length} days with orders
          </p>
        )}
      </div>

      <OrderDetailModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onOrderUpdated={handleOrderUpdated}
      />

      <AdminAddOrderModal
        open={addOrderOpen}
        onClose={() => setAddOrderOpen(false)}
        onSuccess={(order) => {
          setOrders((prev) => [order, ...prev]);
          setSelectedOrder(order);
          setSelectedDate(todayDateKey());
        }}
      />
    </div>
  );
}
