import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { HiOutlineCheckCircle, HiOutlineXCircle } from "react-icons/hi2";
import { useCart } from "../src/context/CartContext";
import { formatPrice } from "../src/lib/formatPrice";

const PAYMENT_API = import.meta.env.VITE_BACKEND_URL + "/api/payment";

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
          setOrder(res.data.order);
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

  return (
    <div className="page-shell flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
      <HiOutlineCheckCircle className="w-20 h-20 text-success mb-4" />
      <h1 className="text-2xl font-bold text-base-content">Payment successful!</h1>
      <p className="text-base-content/60 mt-2 max-w-md">
        Thank you, {order?.name}. Your order{" "}
        <span className="font-mono font-semibold text-primary">{order?.orderId}</span> is confirmed
        and paid.
      </p>
      <p className="text-lg font-bold text-primary mt-4">Total: {formatPrice(order?.total)}</p>
      <div className="flex gap-3 mt-8">
        <Link to="/products" className="btn btn-primary">
          Continue shopping
        </Link>
        <Link to="/" className="btn btn-outline">
          Home
        </Link>
      </div>
    </div>
  );
}
