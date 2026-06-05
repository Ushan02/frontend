import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineArrowLeft,
  HiOutlineCreditCard,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineCheckCircle,
} from "react-icons/hi2";
import { useCart } from "../src/context/CartContext";

const ORDER_API = import.meta.env.VITE_BACKEND_URL + "/api/order";

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw && raw !== "undefined" ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const user = getStoredUser();
  const token = localStorage.getItem("token");
  const { items, subtotal, clearCart } = useCart();

  const [form, setForm] = useState({
    name: user ? `${user.firstName} ${user.lastName}`.trim() : "",
    phone: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null);

  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: "/checkout", message: "Please login to complete checkout." }}
      />
    );
  }

  if (items.length === 0 && !orderSuccess) {
    return <Navigate to="/cart" replace />;
  }

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.phone.trim() || !form.address.trim()) {
      setError("Phone and delivery address are required.");
      return;
    }

    const phone = Number(form.phone.replace(/\D/g, ""));
    if (!phone || String(phone).length < 9) {
      setError("Please enter a valid phone number.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await axios.post(
        ORDER_API,
        {
          name: form.name.trim() || `${user.firstName} ${user.lastName}`,
          phone,
          address: form.address.trim(),
          products: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
        { headers: getAuthHeaders() }
      );

      setOrderSuccess(res.data.order);
      clearCart();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error?.message ||
          "Failed to place order. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 bg-base-200">
        <HiOutlineCheckCircle className="w-20 h-20 text-success mb-4" />
        <h1 className="text-2xl font-bold text-base-content">Order placed!</h1>
        <p className="text-base-content/60 mt-2 text-center max-w-md">
          Thank you, {orderSuccess.name}. Your order{" "}
          <span className="font-mono font-semibold text-primary">{orderSuccess.orderId}</span>{" "}
          has been received.
        </p>
        <p className="text-lg font-bold text-primary mt-4">
          Total: ${Number(orderSuccess.total).toFixed(2)}
        </p>
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

  return (
    <div className="flex-1 bg-base-200 min-w-0">
      <div className="max-w-5xl mx-auto px-3 sm:px-6 py-6 sm:py-10 w-full">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm text-base-content/60 hover:text-primary mb-6"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to cart
        </Link>

        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold flex items-center gap-2 mb-6 sm:mb-8">
          <HiOutlineCreditCard className="w-8 h-8 text-primary" />
          Checkout
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
            <div className="card bg-base-100 shadow-sm border border-base-200/80">
              <div className="card-body">
                <h2 className="card-title text-lg">Delivery details</h2>

                {error && (
                  <div className="alert alert-error text-sm py-2">{error}</div>
                )}

                <label className="form-control w-full">
                  <span className="label-text font-medium flex items-center gap-2">
                    <HiOutlineUser className="w-4 h-4" />
                    Full name
                  </span>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => update("name", e.target.value)}
                    className="input input-bordered w-full mt-1"
                    required
                  />
                </label>

                <label className="form-control w-full">
                  <span className="label-text font-medium flex items-center gap-2">
                    <HiOutlinePhone className="w-4 h-4" />
                    Phone *
                  </span>
                  <input
                    type="tel"
                    placeholder="0771234567"
                    value={form.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    className="input input-bordered w-full mt-1"
                    required
                  />
                </label>

                <label className="form-control w-full">
                  <span className="label-text font-medium flex items-center gap-2">
                    <HiOutlineMapPin className="w-4 h-4" />
                    Delivery address *
                  </span>
                  <textarea
                    placeholder="Street, city, postal code..."
                    value={form.address}
                    onChange={(e) => update("address", e.target.value)}
                    className="textarea textarea-bordered w-full mt-1 min-h-24"
                    required
                  />
                </label>

                <p className="text-xs text-base-content/50">
                  Signed in as {user.email}
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary btn-md sm:btn-lg w-full gap-2 min-h-12"
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Placing order…
                </>
              ) : (
                <>
                  <HiOutlineCreditCard className="w-5 h-5" />
                  Place order — ${subtotal.toFixed(2)}
                </>
              )}
            </button>
          </form>

          <div className="lg:col-span-2">
            <div className="card bg-base-100 shadow-sm border border-base-200/80 lg:sticky lg:top-20">
              <div className="card-body">
                <h2 className="card-title text-lg">Order summary</h2>
                <ul className="space-y-3 max-h-64 overflow-y-auto">
                  {items.map((item) => (
                    <li key={item.productId} className="flex gap-3 text-sm">
                      {item.image && (
                        <img
                          src={item.image}
                          alt=""
                          className="w-12 h-12 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium line-clamp-1">{item.productName}</p>
                        <p className="text-base-content/50">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-semibold shrink-0">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="divider my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">${subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
