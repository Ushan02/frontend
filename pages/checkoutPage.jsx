import { useEffect, useMemo, useState } from "react";

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

  HiOutlineShoppingCart,

  HiOutlineIdentification,

} from "react-icons/hi2";

import { useCart } from "../src/context/CartContext";

import { formatPrice } from "../src/lib/formatPrice";

import { computePaymentSplit } from "../src/lib/paymentSplit";
import {
  CUSTOMER_ID_HINT,
  formatCustomerIdInput,
  isValidCustomerId,
} from "../src/lib/customerId";



const ORDER_API = import.meta.env.VITE_BACKEND_URL + "/api/order";

const PAYMENT_API = import.meta.env.VITE_BACKEND_URL + "/api/payment";

const PENDING_ORDER_KEY = "techzone_pending_order";



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



function methodIcon(id) {

  if (id === "cod") return HiOutlineBanknotes;

  if (id === "stripe") return HiOutlineCreditCard;

  return HiOutlineShoppingCart;

}



export default function CheckoutPage() {

  const [searchParams] = useSearchParams();

  const user = getStoredUser();

  const token = localStorage.getItem("token");

  const { items, subtotal, clearCart } = useCart();



  const [paymentConfig, setPaymentConfig] = useState(null);

  const [paymentMethod, setPaymentMethod] = useState("cod");

  const [cashPercent, setCashPercent] = useState(50);

  const [form, setForm] = useState({

    name: user ? `${user.firstName} ${user.lastName}`.trim() : "",

    phone: "",

    address: "",

    customerId: user?.customerId || "",

  });

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [orderSuccess, setOrderSuccess] = useState(null);



  const cancelled = searchParams.get("cancelled");



  const splitBreakdown = useMemo(() => {

    if (paymentMethod !== "split") return null;

    return computePaymentSplit(subtotal, cashPercent);

  }, [paymentMethod, cashPercent, subtotal]);



  useEffect(() => {

    if (cancelled !== "1") return;



    const orderId = sessionStorage.getItem(PENDING_ORDER_KEY);

    if (!orderId) return;



    sessionStorage.removeItem(PENDING_ORDER_KEY);

    axios

      .post(`${ORDER_API}/${orderId}/cancel-pending`, {}, { headers: getAuthHeaders() })

      .catch(() => {});

  }, [cancelled]);



  useEffect(() => {

    axios

      .get(`${PAYMENT_API}/config`)

      .then((res) => {

        setPaymentConfig(res.data);

        setPaymentMethod(res.data.methods?.[0]?.id || "cod");

      })

      .catch(() => {

        setPaymentConfig({

          mode: "free",

          methods: [

            {

              id: "cod",

              label: "Cash",

              description: "Pay 100% with cash when your order is delivered.",

            },

          ],

        });

        setPaymentMethod("cod");

      });

  }, []);



  useEffect(() => {

    axios

      .get(`${import.meta.env.VITE_BACKEND_URL}/api/users/me`, { headers: getAuthHeaders() })

      .then((res) => {

        const profile = res.data;

        setForm((prev) => ({

          ...prev,

          name: prev.name || `${profile.firstName} ${profile.lastName}`.trim(),

          customerId: profile.customerId || "",

        }));

        if (profile.customerId) {

          const stored = getStoredUser();

          if (stored) {

            localStorage.setItem(

              "user",

              JSON.stringify({ ...stored, customerId: profile.customerId })

            );

          }

        }

      })

      .catch(() => {});

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



    if (paymentMethod === "split" && !splitBreakdown) {

      setError("Choose a valid cash percentage between 1% and 99%.");

      return;

    }

    if (!isValidCustomerId(form.customerId)) {

      setError(CUSTOMER_ID_HINT);

      return;

    }



    setSubmitting(true);

    try {

      const payload = {

        name: form.name.trim() || `${user.firstName} ${user.lastName}`,

        phone,

        address: form.address.trim(),

        customerId: form.customerId,

        paymentMethod,

        products: items.map((item) => ({

          productId: item.productId,

          quantity: item.quantity,

        })),

      };



      if (paymentMethod === "split") {

        payload.cashPercent = cashPercent;

      }



      const res = await axios.post(ORDER_API, payload, { headers: getAuthHeaders() });

      const saveCustomerId = async () => {
        const profileRes = await axios.patch(
          `${import.meta.env.VITE_BACKEND_URL}/api/users/me/customer-id`,
          { customerId: form.customerId },
          { headers: getAuthHeaders() }
        );
        const stored = getStoredUser();
        if (stored) {
          localStorage.setItem(
            "user",
            JSON.stringify({ ...stored, customerId: profileRes.data.customerId })
          );
        }
      };

      await saveCustomerId();

      if (res.data.checkoutUrl) {

        sessionStorage.setItem(PENDING_ORDER_KEY, res.data.order.orderId);

        window.location.href = res.data.checkoutUrl;

        return;

      }

      setOrderSuccess(res.data.order);

      clearCart();

    } catch (err) {

      setError(

        err.response?.data?.message ||

          err.response?.data?.error?.message ||

          "Failed to create order. Please try again."

      );

    } finally {

      setSubmitting(false);

    }

  };



  if (orderSuccess) {

    const isCashOnly = orderSuccess.paymentMethod === "cod";

    return (

      <div className="page-shell flex-1 flex flex-col items-center justify-center px-6 py-16">

        <HiOutlineCheckCircle className="w-20 h-20 text-success mb-4" />

        <h1 className="text-2xl font-bold text-base-content">Order created!</h1>

        <p className="text-base-content/60 mt-2 text-center max-w-md">

          Thank you, {orderSuccess.name}. Your order{" "}

          <span className="font-mono font-semibold text-primary">{orderSuccess.orderId}</span>{" "}

          has been received.

        </p>

        <p className="text-sm text-base-content/50 mt-2">

          {isCashOnly

            ? `Pay ${formatPrice(orderSuccess.total)} in cash on delivery.`

            : "Payment details saved with your order."}

        </p>

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



  const needsCardRedirect = paymentMethod === "stripe" || paymentMethod === "split";

  const submitLabel = needsCardRedirect

    ? paymentMethod === "split" && splitBreakdown

      ? `CREATE ORDER & PAY CARD ${formatPrice(splitBreakdown.cardAmount)}`

      : `CREATE ORDER & PAY ${formatPrice(subtotal)}`

    : `CREATE ORDER — ${formatPrice(subtotal)}`;



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



        <h1 className="section-title flex items-center gap-2 mb-2">

          <HiOutlineShoppingCart className="w-8 h-8 text-primary" />

          Create Order

        </h1>

        <p className="text-base-content/55 text-sm mb-6 sm:mb-8">

          Enter your details, choose cash or card payment, then create your order.

        </p>



        {cancelled && (

          <div className="alert alert-warning text-sm mb-6 rounded-xl">

            Card payment was cancelled. You can try again when ready.

          </div>

        )}



        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 sm:gap-8">

          <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">

            <div className="card card-bg shadow-[0_10px_36px_rgba(3,4,94,0.13)]">

              <div className="card-body">

                <h2 className="card-title text-lg">Your details</h2>



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

                    <HiOutlineIdentification className="w-4 h-4" />

                    Customer ID *

                  </span>

                  <input

                    type="text"

                    value={form.customerId}

                    onChange={(e) =>
                      update("customerId", formatCustomerIdInput(e.target.value))
                    }

                    className="input input-bordered w-full mt-1 font-mono"

                    placeholder="200205202165 or 12345678901V"

                    required

                  />

                  <span className="label-text-alt text-base-content/50 mt-1">

                    Enter your ID here when placing an order — it will be saved to your account. {CUSTOMER_ID_HINT}

                  </span>

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

                    {paymentConfig.methods.map((method) => {

                      const Icon = methodIcon(method.id);

                      return (

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

                              <Icon className="w-5 h-5 text-primary" />

                              {method.label}

                            </p>

                            <p className="text-sm text-base-content/55 mt-1">{method.description}</p>

                          </div>

                        </label>

                      );

                    })}



                    {paymentMethod === "split" && splitBreakdown && (

                      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-4">

                        <div>

                          <div className="flex justify-between text-sm font-medium text-base-content mb-2">

                            <span>Cash on delivery: {cashPercent}%</span>

                            <span>Card now: {splitBreakdown.cardPercent}%</span>

                          </div>

                          <input

                            type="range"

                            min="1"

                            max="99"

                            step="1"

                            value={cashPercent}

                            onChange={(e) => setCashPercent(Number(e.target.value))}

                            className="range range-primary range-sm w-full"

                          />

                          <div className="flex justify-between text-xs text-base-content/45 mt-1">

                            <span>1%</span>

                            <span>99%</span>

                          </div>

                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">

                          <div className="rounded-lg bg-white/80 border border-base-200 p-3">

                            <p className="text-xs text-base-content/50 uppercase">Cash (delivery)</p>

                            <p className="font-bold text-base-content mt-1">

                              {formatPrice(splitBreakdown.cashAmount)}

                            </p>

                          </div>

                          <div className="rounded-lg bg-white/80 border border-base-200 p-3">

                            <p className="text-xs text-base-content/50 uppercase">Card (now)</p>

                            <p className="font-bold text-primary mt-1">

                              {formatPrice(splitBreakdown.cardAmount)}

                            </p>

                          </div>

                        </div>

                      </div>

                    )}



                    <p className="text-xs text-base-content/45">

                      {paymentMethod === "cod" && "Pay the full amount in cash on delivery."}

                      {paymentMethod === "stripe" &&

                        "You will be redirected to Stripe to pay the full amount by card."}

                      {paymentMethod === "split" &&

                        "Pay the card portion now via Stripe. Pay the cash portion on delivery."}

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

                  {needsCardRedirect ? "Creating order & redirecting…" : "Creating order…"}

                </>

              ) : (

                <>

                  {needsCardRedirect ? (

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

                {paymentMethod === "split" && splitBreakdown && (

                  <div className="mt-3 pt-3 border-t border-base-200 space-y-1 text-sm">

                    <div className="flex justify-between text-base-content/60">

                      <span>Cash ({cashPercent}%)</span>

                      <span>{formatPrice(splitBreakdown.cashAmount)}</span>

                    </div>

                    <div className="flex justify-between text-base-content/60">

                      <span>Card ({splitBreakdown.cardPercent}%)</span>

                      <span>{formatPrice(splitBreakdown.cardAmount)}</span>

                    </div>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}


