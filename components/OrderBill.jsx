import {
  BILL_STORE,
  billPaymentMethodLabel,
  billPaymentStatusLabel,
  formatBillDate,
  formatPrice,
  getLineWarranty,
} from "../src/lib/orderBill";

export default function OrderBill({ order }) {
  if (!order) return null;

  const labelTotal = Number(order.labelTotal);
  const showLabelTotal = Number.isFinite(labelTotal) && labelTotal !== order.total;
  const isPaid = order.paymentStatus === "paid";

  return (
    <div className="order-bill bg-white text-slate-800 text-sm leading-normal">
      <div className="rounded-t-xl bg-gradient-to-br from-[#03045e] to-[#0077b6] px-6 py-6 text-white">
        <p className="text-xs uppercase tracking-[0.2em] opacity-90">Invoice</p>
        <h1 className="text-2xl font-extrabold mt-1">{BILL_STORE.name}</h1>
        <p className="text-sm mt-2 opacity-90">Thank you for your purchase</p>
      </div>

      <div className="border border-slate-200 border-t-0 rounded-b-xl px-6 py-5">
        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-400 mb-2">Bill to</p>
            <p className="font-bold text-slate-900">{order.name}</p>
            <p className="text-slate-600 mt-1">{order.email}</p>
            <p className="text-slate-600">Tel: {order.phone ?? "—"}</p>
            <p className="text-slate-600 mt-2 leading-relaxed">{order.address}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-[11px] font-bold uppercase text-slate-400 mb-2">Order</p>
            <p className="font-mono text-lg font-bold text-[#0077b6]">{order.orderId}</p>
            <p className="text-slate-600 mt-2">{formatBillDate(order.date)}</p>
            <p className="text-slate-600 mt-1">
              Payment: {billPaymentMethodLabel(order.paymentMethod)}
            </p>
            <p className={`mt-1 font-semibold ${isPaid ? "text-emerald-600" : "text-amber-600"}`}>
              {billPaymentStatusLabel(order.paymentStatus)}
            </p>
          </div>
        </div>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-500">
              <th className="px-2 py-2.5 text-left text-[11px] font-semibold uppercase">Product</th>
              <th className="px-2 py-2.5 text-left text-[11px] font-semibold uppercase">ID</th>
              <th className="px-2 py-2.5 text-left text-[11px] font-semibold uppercase">Warranty</th>
              <th className="px-2 py-2.5 text-center text-[11px] font-semibold uppercase">Qty</th>
              <th className="px-2 py-2.5 text-right text-[11px] font-semibold uppercase">Unit</th>
              <th className="px-2 py-2.5 text-right text-[11px] font-semibold uppercase">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.products?.map((line, i) => {
              const info = line.productinfo || {};
              const unit = Number(info.price ?? 0);
              const qty = Number(line.quantity ?? 0);
              return (
                <tr key={i}>
                  <td className="px-2 py-2.5 font-medium text-slate-800">
                    {info.productName || "—"}
                  </td>
                  <td className="px-2 py-2.5 font-mono text-xs text-slate-500">
                    {info.productId || "—"}
                  </td>
                  <td className="px-2 py-2.5 text-[#0077b6] font-medium whitespace-nowrap">
                    {getLineWarranty(line)}
                  </td>
                  <td className="px-2 py-2.5 text-center tabular-nums">{qty}</td>
                  <td className="px-2 py-2.5 text-right">{formatPrice(unit)}</td>
                  <td className="px-2 py-2.5 text-right font-semibold">
                    {formatPrice(unit * qty)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {order.paymentMethod === "split" && (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="text-xs font-bold uppercase text-slate-500 mb-2">Payment breakdown</p>
            <p className="text-slate-700">
              Cash ({order.cashPercent ?? 0}%):{" "}
              <strong>{formatPrice(order.cashAmount ?? 0)}</strong>
            </p>
            <p className="text-slate-700 mt-1">
              Card ({order.cardPercent ?? 0}%):{" "}
              <strong>{formatPrice(order.cardAmount ?? 0)}</strong>
            </p>
          </div>
        )}

        <div className="mt-5 pt-4 border-t-2 border-slate-200 text-right">
          <p className="text-slate-500">Order total</p>
          <p className="text-2xl font-extrabold text-[#03045e]">{formatPrice(order.total)}</p>
          {showLabelTotal && (
            <p className="text-xs text-slate-400 line-through mt-1">
              Labeled: {formatPrice(labelTotal)}
            </p>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-200 text-center text-xs text-slate-500">
          <p>{BILL_STORE.address}</p>
          <p className="mt-1">
            {BILL_STORE.email} · {BILL_STORE.phone}
          </p>
          <p className="mt-3 text-slate-400">
            Computer-generated invoice from {BILL_STORE.name}
          </p>
        </div>
      </div>
    </div>
  );
}
