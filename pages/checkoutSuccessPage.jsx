import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi2";
import { useCart } from "../src/context/CartContext";
import { formatPrice } from "../src/lib/formatPrice";

const PAYMENT_API = import.meta.env.VITE_BACKEND_URL + "/api/payment";
const PENDING_ORDER_KEY = "techzone_pending_order";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function CheckoutSuccessPage() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { clearCart } = useCart();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(Boolean(sessionId));
  const [billEmailSent, setBillEmailSent] = useState(false);

  useEffect(() => {
    if (!sessionId) return;

    let cancelled = false;

    async function confirmPayment() {
      try {
        const res = await axios.get(`${PAYMENT_API}/complete`, {
          params: { session_id: sessionId },
          headers: getAuthHeaders(),
        });
        if (!cancelled) {
          sessionStorage.removeItem(PENDING_ORDER_KEY);
          setOrder(res.data.order);
          setBillEmailSent(Boolean(res.data.billEmail?.sent));
          clearCart();
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to confirm payment.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    confirmPayment();
    return () => {
      cancelled = true;
    };
  }, [sessionId, clearCart]);

  if (!sessionId) {
    return <Navigate to="/checkout" replace />;
  }

  if (loading) {
    return (
      <div className="page-shell flex-1 flex flex-col items-center justify-center px-6 py-16">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-base-content/60 mt-4 text-sm">Confirming your payment…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <HiOutlineXCircle className="w-20 h-20 text-error mb-4" />
        <h1 className="text-2xl font-bold text-base-content">Payment issue</h1>
        <p className="text-base-content/60 mt-2 max-w-md">{error}</p>
        <Link to="/checkout" className="btn btn-primary mt-8">
          Back to checkout
        </Link>
      </div>
    );
  }

  const isSplit = order?.paymentMethod === "split";
  const isFullCard = order?.paymentMethod === "stripe";

  return (
    <div className="page-shell flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
      <HiOutlineCheckCircle className="w-20 h-20 text-success mb-4" />
      <h1 className="text-2xl font-bold text-base-content">
        {isSplit ? "Card payment received!" : "Payment successful!"}
      </h1>
      <p className="text-base-content/60 mt-2 max-w-md">
        Thank you, {order?.name}. Your order{" "}
        <span className="font-mono font-semibold text-primary">{order?.orderId}</span>{" "}
        {isSplit ? "is confirmed. Pay the cash portion on delivery." : "is confirmed and paid."}
      </p>

      <div className="mt-4 max-w-sm w-full rounded-xl border border-base-200 bg-base-100 p-4 text-left text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-base-content/60">Order total</span>
          <span className="font-bold">{formatPrice(order?.total)}</span>
        </div>
        {isSplit && (
          <>
            <div className="flex justify-between text-success">
              <span>Card paid ({order?.cardPercent}%)</span>
              <span className="font-semibold">{formatPrice(order?.cardAmount)}</span>
            </div>
            <div className="flex justify-between text-warning">
              <span>Cash on delivery ({order?.cashPercent}%)</span>
              <span className="font-semibold">{formatPrice(order?.cashAmount)}</span>
            </div>
          </>
        )}
        {isFullCard && (
          <div className="flex justify-between text-success">
            <span>Card paid</span>
            <span className="font-semibold">{formatPrice(order?.total)}</span>
          </div>
        )}
      </div>

      {billEmailSent && order?.paymentStatus === "paid" && (
        <p className="text-sm text-base-content/60 mt-4 max-w-md">
          Your invoice has been sent to <span className="font-medium">{order.email}</span>.
        </p>
      )}

      <div className="flex flex-wrap justify-center gap-3 mt-8">
        <Link to="/my-orders" className="btn btn-primary">
          View my orders
        </Link>
        <Link to="/products" className="btn btn-outline">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
