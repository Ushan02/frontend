import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineChevronDown,
  HiOutlineChevronUp,
  HiOutlineShoppingBag,
  HiOutlineMapPin,
  HiOutlinePhone,
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import { formatPrice } from "../src/lib/formatPrice";
import { getLineWarranty } from "../src/lib/orderBill";
import { formatOrderTime } from "../src/lib/orderDates";

const ORDER_API = import.meta.env.VITE_BACKEND_URL + "/api/order";

function PaymentBadge({ method, paymentStatus }) {
  const labels = {
    pending_cod: "COD — pending",
    pending_pos: "POS card — pending",
    awaiting_payment: "Awaiting payment",
    paid: "Paid",
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
  const labels = {
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${colors[status] || "bg-slate-100"}`}>
      {labels[status] || status}
    </span>
  );
}

function formatOrderDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getProductImage(line) {
  const images = line.productinfo?.images;
  if (Array.isArray(images) && images.length > 0) return images[0];
  return null;
}

export default function CustomerOrderCard({ order: initialOrder, onOrderUpdated }) {
  const [order, setOrder] = useState(initialOrder);
  const [expanded, setExpanded] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const itemCount = order.products?.reduce((sum, line) => sum + Number(line.quantity || 0), 0) || 0;
  const canCancel = order.paymentStatus === "awaiting_payment" && order.status !== "cancelled";

  const handleCancel = async () => {
    if (!window.confirm("Cancel this order? Stock will be restored and you can place a new order.")) {
      return;
    }
    setCancelling(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `${ORDER_API}/${order.orderId}/cancel-pending`,
        {},
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setOrder(res.data.order);
      onOrderUpdated?.(res.data.order);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel order.");
    } finally {
      setCancelling(false);
    }
  };

  return (
    <article className="card-bg rounded-2xl border border-base-300/60 shadow-[0_10px_36px_rgba(3,4,94,0.1)] overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((open) => !open)}
        className="w-full text-left p-4 sm:p-5 hover:bg-base-200/30 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="font-mono text-sm font-bold text-primary">{order.orderId}</span>
              <StatusBadge status={order.status} />
              <PaymentBadge method={order.paymentMethod} paymentStatus={order.paymentStatus} />
            </div>
            <p className="text-sm text-base-content/60">
              {formatOrderDate(order.date)} · {formatOrderTime(order.date)}
            </p>
            <p className="text-sm text-base-content/70 mt-1">
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 shrink-0">
            <p className="text-lg sm:text-xl font-extrabold text-primary">{formatPrice(order.total)}</p>
            <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
              {expanded ? "Hide details" : "View details"}
              {expanded ? (
                <HiOutlineChevronUp className="w-4 h-4" />
              ) : (
                <HiOutlineChevronDown className="w-4 h-4" />
              )}
            </span>
          </div>
        </div>
      </button>

      {expanded && (
        <div className="border-t border-base-300/50 px-4 sm:px-5 pb-5 pt-4 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-base-200/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50 mb-1">
                Delivery
              </p>
              <p className="font-medium">{order.name}</p>
              <p className="text-base-content/70 mt-1 flex items-start gap-1.5">
                <HiOutlineMapPin className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                {order.address}
              </p>
              <p className="text-base-content/70 mt-1 flex items-center gap-1.5">
                <HiOutlinePhone className="w-4 h-4 shrink-0 text-primary" />
                {order.phone}
              </p>
            </div>
            <div className="rounded-xl bg-base-200/40 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-base-content/50 mb-1">
                Payment
              </p>
              <p className="font-medium capitalize">
                {order.paymentMethod === "split"
                  ? `Cash ${order.cashPercent}% + Card ${order.cardPercent}%`
                  : order.paymentMethod === "stripe" || order.paymentMethod === "card"
                    ? "Card"
                    : "Cash on delivery"}
              </p>
              {order.paymentMethod === "split" && (
                <div className="mt-2 space-y-1 text-base-content/70">
                  <p>Card: {formatPrice(order.cardAmount)}</p>
                  <p>Cash: {formatPrice(order.cashAmount)}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-base-content mb-3 flex items-center gap-2">
              <HiOutlineShoppingBag className="w-4 h-4 text-primary" />
              Products purchased
            </p>
            <div className="space-y-3">
              {order.products?.map((line, i) => {
                const info = line.productinfo || {};
                const qty = Number(line.quantity || 0);
                const unitPrice = Number(info.price ?? 0);
                const image = getProductImage(line);
                const warranty = getLineWarranty(line);

                return (
                  <div
                    key={`${info.productId}-${i}`}
                    className="flex gap-3 sm:gap-4 p-3 rounded-xl border border-base-300/50 bg-white"
                  >
                    <Link
                      to={`/products/${info.productId}`}
                      className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-slate-50 border border-sky/20"
                    >
                      {image ? (
                        <img src={image} alt={info.productName} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <HiOutlineShoppingBag className="w-6 h-6 text-base-content/20" />
                        </div>
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/products/${info.productId}`}
                        className="font-semibold text-base-content hover:text-primary transition-colors line-clamp-2"
                      >
                        {info.productName || "—"}
                      </Link>
                      <p className="text-xs text-base-content/50 font-mono mt-0.5">{info.productId}</p>
                      <p className="text-xs text-base-content/60 mt-1 flex items-center gap-1">
                        <HiOutlineShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
                        Warranty: {warranty}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
                        <span className="text-sm text-base-content/70">
                          Qty {qty} × {formatPrice(unitPrice)}
                        </span>
                        <span className="font-bold text-primary">{formatPrice(unitPrice * qty)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-base-300/40">
            <div className="text-sm">
              <span className="text-base-content/60">Order total </span>
              <span className="text-lg font-extrabold text-primary">{formatPrice(order.total)}</span>
            </div>
            {canCancel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelling}
                className="btn btn-outline btn-error btn-sm rounded-xl"
              >
                {cancelling ? "Cancelling…" : "Cancel unpaid order"}
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  );
}
