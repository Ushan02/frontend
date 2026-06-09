import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

import axios from "axios";

import {

  HiOutlineXMark,

  HiOutlineShoppingBag,

  HiOutlineCheckCircle,

  HiOutlineCreditCard,

  HiOutlinePrinter,

} from "react-icons/hi2";

import { formatPrice } from "../src/lib/formatPrice";

import { API_BASE, getAuthHeaders } from "../src/lib/adminApi";

import { getLineWarranty } from "../src/lib/orderBill";

import OrderBill from "./OrderBill";



const ORDER_API = API_BASE + "/api/order";



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



function formatOrderDate(date) {

  if (!date) return { date: "—", time: "—" };

  const d = new Date(date);

  return {

    date: d.toLocaleDateString(undefined, {

      weekday: "short",

      year: "numeric",

      month: "short",

      day: "numeric",

    }),

    time: d.toLocaleTimeString(undefined, {

      hour: "2-digit",

      minute: "2-digit",

      second: "2-digit",

    }),

  };

}



function paymentMethodLabel(method) {

  if (method === "split") return "Cash + Card (POS)";

  if (method === "card" || method === "stripe") return "Card (POS)";

  return "Cash";

}



export default function OrderDetailModal({ order, onClose, onOrderUpdated }) {

  const [payLoading, setPayLoading] = useState(false);

  const [payError, setPayError] = useState("");

  const [billEmailMsg, setBillEmailMsg] = useState("");

  const [pos, setPos] = useState({

    posTransactionRef: "",

    posMachineId: "",

    posNotes: "",

  });

  useEffect(() => {
    if (!order) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [order]);

  useEffect(() => {
    setPayError("");
    setBillEmailMsg("");
    setPayLoading(false);
    setPos({ posTransactionRef: "", posMachineId: "", posNotes: "" });
  }, [order?.orderId]);

  if (!order) return null;



  const { date, time } = formatOrderDate(order.date);

  const labelTotal = Number(order.labelTotal);

  const showLabelTotal = Number.isFinite(labelTotal) && labelTotal !== order.total;

  const paymentDone = order.paymentStatus === "paid";

  const needsPos = order.paymentStatus === "pending_pos";

  const canMarkPaid =

    order.paymentStatus === "pending_cod" ||

    order.paymentStatus === "partial_paid" ||

    needsPos;

  const markPaidLabel = needsPos

    ? "Payment Successful"

    : order.paymentStatus === "partial_paid"

      ? "Cash received"

      : "Payment successful";



  const handlePaymentSuccess = async () => {

    setPayError("");

    if (needsPos && !pos.posTransactionRef.trim()) {

      setPayError("POS transaction reference is required.");

      return;

    }



    setPayLoading(true);

    try {

      const body = needsPos ? pos : {};

      const res = await axios.patch(

        `${ORDER_API}/${order.orderId}/payment-success`,

        body,

        { headers: getAuthHeaders() }

      );

      onOrderUpdated?.(res.data.order);

      setPos({ posTransactionRef: "", posMachineId: "", posNotes: "" });

      const bill = res.data.billEmail;

      if (bill?.sent) {

        setBillEmailMsg(`Invoice emailed to ${bill.email}`);

      } else if (res.data.order?.paymentStatus === "paid" && bill && !bill.skipped) {

        setBillEmailMsg(bill.error || "Invoice could not be emailed.");

      } else {

        setBillEmailMsg("");

      }

    } catch (err) {

      setPayError(err.response?.data?.message || "Failed to mark payment as successful.");

    } finally {

      setPayLoading(false);

    }

  };



  const handlePrintBill = () => {

    window.print();

  };



  return createPortal(

    <>

    <div id="order-bill-print" className="hidden print:block">

      <OrderBill order={order} />

    </div>

    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 no-print">

      <button

        type="button"

        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"

        aria-label="Close order details"

        onClick={onClose}

      />

      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200">

        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 bg-white rounded-t-2xl">

          <div>

            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">

              <HiOutlineShoppingBag className="w-6 h-6 text-[#0077b6]" />

              Order Details

            </h2>

            <p className="text-sm font-mono text-slate-500 mt-0.5">{order.orderId}</p>

          </div>

          <button

            type="button"

            onClick={onClose}

            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 shrink-0"

            aria-label="Close"

          >

            <HiOutlineXMark className="w-5 h-5" />

          </button>

        </div>



        <div className="p-6 space-y-6">

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Date</p>

              <p className="text-sm font-medium text-slate-800">{date}</p>

            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Time</p>

              <p className="text-sm font-medium text-slate-800">{time}</p>

            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Status</p>

              <StatusBadge status={order.status} />

            </div>

            <div className="rounded-xl bg-slate-50 border border-slate-100 p-4">

              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Payment</p>

              <PaymentBadge method={order.paymentMethod} paymentStatus={order.paymentStatus} />

            </div>

          </div>



          <div className="grid sm:grid-cols-2 gap-4">

            <div className="rounded-xl border border-slate-200 p-4">

              <p className="text-sm font-semibold text-slate-800 mb-3">Customer</p>

              <dl className="space-y-2 text-sm">

                <div>

                  <dt className="text-slate-400 text-xs uppercase">Name</dt>

                  <dd className="text-slate-800 font-medium">{order.name}</dd>

                </div>

                <div>

                  <dt className="text-slate-400 text-xs uppercase">Email</dt>

                  <dd className="text-slate-700">{order.email}</dd>

                </div>

                <div>

                  <dt className="text-slate-400 text-xs uppercase">Phone</dt>

                  <dd className="text-slate-700">{order.phone ?? "—"}</dd>

                </div>

              </dl>

            </div>

            <div className="rounded-xl border border-slate-200 p-4">

              <p className="text-sm font-semibold text-slate-800 mb-3">Delivery</p>

              <p className="text-sm text-slate-600 leading-relaxed">{order.address}</p>

              <p className="text-xs text-slate-400 mt-3">

                Payment: {paymentMethodLabel(order.paymentMethod)}

              </p>

            </div>

          </div>



          {order.paymentMethod === "split" && (

            <div className="rounded-xl border border-slate-200 p-4">

              <p className="text-sm font-semibold text-slate-800 mb-3">Payment breakdown</p>

              <div className="grid sm:grid-cols-2 gap-3 text-sm">

                <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">

                  <p className="text-xs text-amber-700 uppercase">Cash ({order.cashPercent ?? 0}%)</p>

                  <p className="font-bold text-slate-800 mt-1">{formatPrice(order.cashAmount ?? 0)}</p>

                </div>

                <div className="rounded-lg bg-sky-50 border border-sky-100 p-3">

                  <p className="text-xs text-sky-700 uppercase">Card ({order.cardPercent ?? 0}%)</p>

                  <p className="font-bold text-slate-800 mt-1">{formatPrice(order.cardAmount ?? 0)}</p>

                </div>

              </div>

            </div>

          )}



          {order.posTransactionRef && (

            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm">

              <p className="font-semibold text-emerald-900 mb-2 flex items-center gap-2">

                <HiOutlineCreditCard className="w-5 h-5" />

                POS payment recorded

              </p>

              <p className="font-mono text-slate-800">{order.posTransactionRef}</p>

              {order.posMachineId && (

                <p className="text-slate-600 mt-1">Machine: {order.posMachineId}</p>

              )}

              {order.posNotes && <p className="text-slate-600 mt-1">{order.posNotes}</p>}

            </div>

          )}



          <div>

            <p className="text-sm font-semibold text-slate-800 mb-3">Items</p>

            <div className="rounded-xl border border-slate-200 overflow-x-auto">

              <table className="w-full text-left min-w-[620px]">

                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">

                  <tr>

                    <th className="px-4 py-3 text-xs font-semibold uppercase">Product</th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase">ID</th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase">Warranty</th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase text-center">Qty</th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase text-right">Unit price</th>

                    <th className="px-4 py-3 text-xs font-semibold uppercase text-right">Line total</th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-slate-100">

                  {order.products?.map((line, i) => {

                    const unitPrice = Number(line.productinfo?.price ?? 0);

                    const qty = Number(line.quantity ?? 0);

                    const warranty = getLineWarranty(line);

                    return (

                      <tr key={i} className="text-sm">

                        <td className="px-4 py-3 font-medium text-slate-800">

                          {line.productinfo?.productName || "—"}

                        </td>

                        <td className="px-4 py-3 font-mono text-xs text-slate-500">

                          {line.productinfo?.productId || "—"}

                        </td>

                        <td className="px-4 py-3 text-[#0077b6] font-medium whitespace-nowrap">

                          {warranty}

                        </td>

                        <td className="px-4 py-3 text-center tabular-nums">{qty}</td>

                        <td className="px-4 py-3 text-right">{formatPrice(unitPrice)}</td>

                        <td className="px-4 py-3 text-right font-semibold">

                          {formatPrice(unitPrice * qty)}

                        </td>

                      </tr>

                    );

                  })}

                </tbody>

              </table>

            </div>

          </div>



          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">

            <div className="flex justify-between items-center">

              <span className="text-sm font-semibold text-slate-700">Order total</span>

              <span className="text-xl font-bold text-slate-900">{formatPrice(order.total)}</span>

            </div>

            {showLabelTotal && (

              <p className="text-xs text-slate-400 mt-1 line-through">

                Labeled: {formatPrice(labelTotal)}

              </p>

            )}

          </div>



          {needsPos && (

            <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-4 space-y-3">

              <p className="text-sm font-semibold text-slate-800">POS details (manual)</p>

              <input

                type="text"

                placeholder="Transaction reference *"

                value={pos.posTransactionRef}

                onChange={(e) => setPos((p) => ({ ...p, posTransactionRef: e.target.value }))}

                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"

              />

              <input

                type="text"

                placeholder="POS machine ID"

                value={pos.posMachineId}

                onChange={(e) => setPos((p) => ({ ...p, posMachineId: e.target.value }))}

                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"

              />

              <textarea

                placeholder="Notes"

                value={pos.posNotes}

                onChange={(e) => setPos((p) => ({ ...p, posNotes: e.target.value }))}

                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm min-h-16"

              />

            </div>

          )}



          {payError && (

            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">

              {payError}

            </div>

          )}



          {billEmailMsg && (

            <div className="px-4 py-3 rounded-lg bg-sky-50 border border-sky-200 text-sky-800 text-sm">

              {billEmailMsg}

            </div>

          )}



          <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">

            <button

              type="button"

              onClick={handlePrintBill}

              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#0077b6] hover:bg-[#03045e] text-white text-sm font-semibold"

            >

              <HiOutlinePrinter className="w-5 h-5" />

              Print bill

            </button>



            {canMarkPaid && (

              <button

                type="button"

                onClick={handlePaymentSuccess}

                disabled={payLoading}

                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"

              >

                <HiOutlineCheckCircle className="w-5 h-5" />

                {payLoading ? "Updating…" : markPaidLabel}

              </button>

            )}

            {paymentDone && (

              <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">

                <HiOutlineCheckCircle className="w-5 h-5" />

                Payment successful

              </span>

            )}

            <button

              type="button"

              onClick={onClose}

              className="px-5 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"

            >

              Close

            </button>

          </div>

        </div>

      </div>

    </div>

    </>,

    document.body

  );

}


