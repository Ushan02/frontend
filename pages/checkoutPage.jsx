import { useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineArrowLeft,
  HiOutlineCreditCard,
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineCheckCircle,
  HiOutlineBanknotes,
} from "react-icons/hi2";
import { useCart } from "../src/context/CartContext";
import { formatPrice } from "../src/lib/formatPrice";

const ORDER_API = import.meta.env.VITE_BACKEND_URL + "/api/order";
const PAYMENT_API = import.meta.env.VITE_BACKEND_URL + "/api/payment";

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
  const [searchParams] = useSearchParams();
  const user = getStoredUser();
  const token = localStorage.getItem("token");
  const { items, subtotal, clearCart } = useCart();

  const [paymentConfig, setPaymentConfig] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [form, setForm] = useState({
    name: user ? `${user.firstName} ${user.lastName}`.trim() : "",
    phone: "",
    address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(null);

  const cancelled = searchParams.get("cancelled");

  useEffect(() => {
    axios
      .get(`${PAYMENT_API}/config`)
      .then((res) => {
        setPaymentConfig(res.data);
        const defaultMethod = res.data.methods?.[0]?.id || "cod";
        setPaymentMethod(defaultMethod);
      })
      .catch(() => {
        setPaymentConfig({
          mode: "free",
          methods: [
            {
              id: "cod",
              label: "Cash on Delivery",
              description: "Pay with cash when your order is delivered.",
            },
          ],
        });
        setPaymentMethod("cod");
      });
  }, []);

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
          paymentMethod,
          products: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
          })),
        },
        { headers: getAuthHeaders() }
      );

      if (res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
        return;
      }

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
      <div className="page-shell flex-1 flex flex-col items-center justify-center px-6 py-16">
        <HiOutlineCheckCircle className="w-20 h-20 text-success mb-4" />
        <h1 className="text-2xl font-bold text-base-content">Order placed!</h1>
        <p className="text-base-content/60 mt-2 text-center max-w-md">
          Thank you, {orderSuccess.name}. Your order{" "}
          <span className="font-mono font-semibold text-primary">{orderSuccess.orderId}</span>{" "}
          has been received.
        </p>
        <p className="text-sm text-base-content/50 mt-2">Payment: Cash on Delivery</p>
        <p className="text-lg font-bold text-primary mt-4">
          Total: {formatPrice(orderSuccess.total)}
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

  const isStripe = paymentConfig?.mode === "stripe";
  const submitLabel = isStripe
    ? `PAY ${formatPrice(subtotal)} WITH CARD`
    : `PLACE ORDER — ${formatPrice(subtotal)}`;

  return (
    <div className="page-shell flex-1 min-w-0">
      <div className="page-container max-w-5xl py-6 sm:py-10 w-full">
        <Link
          to="/cart"
          className="inline-flex items-center gap-2 text-sm text-base-content/60 hover:text-primary mb-6"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to cart
        </Link>

        <h1 className="section-title flex items-center gap-2 mb-6 sm:mb-8">
          <HiOutlineCreditCard className="w-8 h-8 text-primary" />
          Checkout
        </h1>

        {cancelled && (
          <div className="alert alert-warning text-sm mb-6 rounded-xl">
            Payment was cancelled. You can try again when ready.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
            <div className="card card-bg shadow-[0_10px_36px_rgba(3,4,94,0.13)]">
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

            <div className="card card-bg shadow-[0_10px_36px_rgba(3,4,94,0.13)]">
              <div className="card-body">
                <h2 className="card-title text-lg">Payment method</h2>
                {!paymentConfig ? (
                  <p className="text-sm text-base-content/50">Loading payment options…</p>
                ) : (
                  <div className="space-y-3">
                    {paymentConfig.methods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition ${
                          paymentMethod === method.id
                            ? "border-primary bg-primary/5"
                            : "border-base-300 hover:border-primary/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={paymentMethod === method.id}
                          onChange={() => setPaymentMethod(method.id)}
                          className="radio radio-primary mt-1"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-base-content flex items-center gap-2">
                            {method.id === "cod" ? (
                              <HiOutlineBanknotes className="w-5 h-5 text-primary" />
                            ) : (
                              <HiOutlineCreditCard className="w-5 h-5 text-primary" />
                            )}
                            {method.label}
                            {paymentConfig.mode === "free" && (
                              <span className="badge badge-success badge-sm">Free</span>
                            )}
                          </p>
                          <p className="text-sm text-base-content/55 mt-1">{method.description}</p>
                        </div>
                      </label>
                    ))}
                    <p className="text-xs text-base-content/45">
                      {isStripe
                        ? "You will be redirected to Stripe to complete payment securely."
                        : "No online payment fees — pay the delivery person when your order arrives."}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || !paymentConfig}
              className="btn btn-primary btn-md sm:btn-lg w-full gap-2 min-h-12"
            >
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  {isStripe ? "Redirecting to payment…" : "Placing order…"}
                </>
              ) : (
                <>
                  {isStripe ? (
                    <HiOutlineCreditCard className="w-5 h-5" />
                  ) : (
                    <HiOutlineBanknotes className="w-5 h-5" />
                  )}
                  {submitLabel}
                </>
              )}
            </button>
          </form>

          <div className="lg:col-span-2">
            <div className="card card-bg shadow-[0_10px_36px_rgba(3,4,94,0.13)] lg:sticky lg:top-20">
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
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </li>
                  ))}
                </ul>
                <div className="divider my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-primary">{formatPrice(subtotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
