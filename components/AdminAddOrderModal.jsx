import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  CUSTOMER_ID_HINT,
  formatCustomerIdInput,
  isValidCustomerId,
  normalizeCustomerId,
} from "../src/lib/customerId";
import {
  HiOutlineXMark,
  HiOutlinePlus,
  HiOutlineTrash,
  HiOutlineCheckCircle,
  HiOutlineShoppingCart,
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import { API_BASE, getAuthHeaders } from "../src/lib/adminApi";
import { getDefaultWarranty } from "../src/lib/productCategories";

const ORDER_API = API_BASE + "/api/order/admin";

const PAYMENT_OPTIONS = [
  { value: "cod", label: "Cash" },
  { value: "card", label: "Card payment (POS machine)" },
  { value: "split", label: "Cash + Card" },
];

const ORDER_STATUS_OPTIONS = [
  { value: "pending", label: "Pending", selectClass: "bg-amber-50 text-amber-900 border-amber-200" },
  { value: "processing", label: "Processing", selectClass: "bg-blue-50 text-blue-900 border-blue-200" },
  { value: "shipped", label: "Shipped", selectClass: "bg-indigo-50 text-indigo-900 border-indigo-200" },
  { value: "delivered", label: "Done", selectClass: "bg-green-100 text-green-900 border-green-300" },
  { value: "cancelled", label: "Cancelled", selectClass: "bg-red-50 text-red-900 border-red-200" },
];

const DEFAULT_ORDER_STATUS = "delivered";

const PRODUCTS_API = API_BASE + "/api/products";
const REPAIR_API = API_BASE + "/api/repairs";

const emptyLine = () => ({
  productId: "",
  quantity: "1",
  productName: "",
  warranty: "",
  lookup: "idle",
});

export default function AdminAddOrderModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState({
    customerId: "",
    name: "",
    email: "",
    phone: "",
    address: "",
    paymentMethod: "cod",
    cashPercent: 50,
    status: DEFAULT_ORDER_STATUS,
  });
  const [customerLookup, setCustomerLookup] = useState("idle");
  const [lines, setLines] = useState([emptyLine()]);
  const [pos, setPos] = useState({
    posTransactionRef: "",
    posMachineId: "",
    posNotes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const lookupTimers = useRef({});
  const customerLookupTimer = useRef(null);

  useEffect(() => {
    if (!open) return;
    setForm({
      customerId: "",
      name: "",
      email: "",
      phone: "",
      address: "",
      paymentMethod: "cod",
      cashPercent: 50,
      status: DEFAULT_ORDER_STATUS,
    });
    setCustomerLookup("idle");
    setLines([emptyLine()]);
    setPos({ posTransactionRef: "", posMachineId: "", posNotes: "" });
    setError("");
  }, [open]);

  useEffect(() => {
    return () => {
      Object.values(lookupTimers.current).forEach(clearTimeout);
      if (customerLookupTimer.current) clearTimeout(customerLookupTimer.current);
    };
  }, []);

  const lookupCustomer = async (rawId) => {
    const normalized = normalizeCustomerId(rawId);
    if (!isValidCustomerId(normalized)) {
      setCustomerLookup("invalid");
      return;
    }

    setCustomerLookup("loading");
    try {
      const res = await axios.get(`${REPAIR_API}/customer-lookup`, {
        params: { customerId: normalized },
        headers: getAuthHeaders(),
      });
      const customer = res.data.customer;
      setForm((prev) => ({
        ...prev,
        customerId: normalized,
        name: `${customer.firstName} ${customer.lastName}`.trim(),
        email: customer.email,
      }));
      setCustomerLookup("found");
    } catch {
      setCustomerLookup("not_found");
    }
  };

  const handleCustomerIdChange = (value) => {
    const formatted = formatCustomerIdInput(value);
    setForm((prev) => ({ ...prev, customerId: formatted }));
    if (customerLookupTimer.current) clearTimeout(customerLookupTimer.current);
    customerLookupTimer.current = setTimeout(() => lookupCustomer(formatted), 450);
  };

  const lookupProduct = (index, productId) => {
    const id = productId.trim();
    if (!id) {
      setLines((prev) =>
        prev.map((line, i) =>
          i === index ? { ...line, productName: "", warranty: "", lookup: "idle" } : line
        )
      );
      return;
    }

    setLines((prev) =>
      prev.map((line, i) =>
        i === index ? { ...line, lookup: "loading", productName: "", warranty: "" } : line
      )
    );

    if (lookupTimers.current[index]) clearTimeout(lookupTimers.current[index]);
    lookupTimers.current[index] = setTimeout(async () => {
      try {
        const res = await axios.get(`${PRODUCTS_API}/${encodeURIComponent(id)}`, {
          headers: getAuthHeaders(),
        });
        const product = res.data;
        const warranty = product.warranty || getDefaultWarranty(product.category);
        setLines((prev) =>
          prev.map((line, i) =>
            i === index
              ? {
                  ...line,
                  productName: product.productName || "",
                  warranty,
                  lookup: "found",
                }
              : line
          )
        );
      } catch {
        setLines((prev) =>
          prev.map((line, i) =>
            i === index ? { ...line, productName: "", warranty: "", lookup: "not_found" } : line
          )
        );
      }
    }, 400);
  };

  if (!open) return null;

  const needsPosFields = form.paymentMethod === "card" || form.paymentMethod === "split";
  const statusSelectClass =
    ORDER_STATUS_OPTIONS.find((opt) => opt.value === form.status)?.selectClass ||
    "bg-white text-slate-800 border-slate-200";

  const updateLine = (index, field, value) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)));
    if (field === "productId") lookupProduct(index, value);
  };

  const addLine = () => setLines((prev) => [...prev, emptyLine()]);
  const removeLine = (index) => {
    if (lines.length === 1) return;
    setLines((prev) => prev.filter((_, i) => i !== index));
  };

  const buildPayload = (markPaymentSuccessful) => {
    const products = lines
      .map((line) => ({
        productId: line.productId.trim(),
        quantity: Number(line.quantity),
      }))
      .filter((line) => line.productId);

    return {
      customerId: form.customerId.trim() || undefined,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: Number(String(form.phone).replace(/\D/g, "")),
      address: form.address.trim(),
      paymentMethod: form.paymentMethod,
      cashPercent: form.paymentMethod === "split" ? form.cashPercent : undefined,
      status: form.status,
      products,
      markPaymentSuccessful,
      ...(needsPosFields && markPaymentSuccessful ? pos : {}),
    };
  };

  const validate = (markPaymentSuccessful) => {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Customer name and email are required.");
      return false;
    }
    if (!form.phone.trim() || !form.address.trim()) {
      setError("Phone and address are required.");
      return false;
    }
    const products = lines.filter((l) => l.productId.trim());
    if (products.length === 0) {
      setError("Add at least one product with a product ID.");
      return false;
    }
    for (const line of products) {
      if (!Number.isFinite(Number(line.quantity)) || Number(line.quantity) < 1) {
        setError("Each product quantity must be at least 1.");
        return false;
      }
    }
    return true;
  };

  const submit = async (markPaymentSuccessful) => {
    setError("");
    if (!validate(markPaymentSuccessful)) return;

    setLoading(true);
    try {
      const res = await axios.post(ORDER_API, buildPayload(markPaymentSuccessful), {
        headers: getAuthHeaders(),
      });
      onSuccess?.(res.data.order);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200">
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <HiOutlineShoppingCart className="w-6 h-6 text-[#0077b6]" />
            Add Order
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500">
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">Customer details</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-slate-500 uppercase">Customer ID</span>
                <input
                  type="text"
                  value={form.customerId}
                  onChange={(e) => handleCustomerIdChange(e.target.value)}
                  placeholder="1999236512V"
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
                />
                {customerLookup === "loading" && (
                  <span className="text-xs text-slate-500 mt-1 block">Looking up customer…</span>
                )}
                {customerLookup === "found" && (
                  <span className="text-xs text-emerald-700 mt-1 block">Customer found — name and email filled.</span>
                )}
                {customerLookup === "not_found" && (
                  <span className="text-xs text-red-600 mt-1 block">Customer not found for this ID.</span>
                )}
                <span className="text-xs text-slate-400 mt-1 block">{CUSTOMER_ID_HINT}</span>
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-slate-500 uppercase">Full name *</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-500 uppercase">Email *</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs font-medium text-slate-500 uppercase">Phone *</span>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  required
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-medium text-slate-500 uppercase">Address *</span>
                <textarea
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm min-h-20"
                  required
                />
              </label>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-800">Products</h3>
              <button
                type="button"
                onClick={addLine}
                className="text-sm text-[#0077b6] hover:underline flex items-center gap-1"
              >
                <HiOutlinePlus className="w-4 h-4" />
                Add item
              </button>
            </div>
            {lines.map((line, index) => (
              <div key={index} className="space-y-1">
                <div className="flex gap-2 items-end">
                  <label className="flex-1 block">
                    <span className="text-xs font-medium text-slate-500 uppercase">Product ID</span>
                    <input
                      type="text"
                      value={line.productId}
                      onChange={(e) => updateLine(index, "productId", e.target.value)}
                      placeholder="e.g. LAP-011"
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
                    />
                  </label>
                  <label className="w-24 block">
                    <span className="text-xs font-medium text-slate-500 uppercase">Qty</span>
                    <input
                      type="number"
                      min="1"
                      value={line.quantity}
                      onChange={(e) => updateLine(index, "quantity", e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => removeLine(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg mb-0.5"
                    aria-label="Remove line"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
                {line.lookup === "loading" && (
                  <p className="text-xs text-slate-400 pl-1">Looking up product…</p>
                )}
                {line.lookup === "not_found" && line.productId.trim() && (
                  <p className="text-xs text-red-500 pl-1">Product not found</p>
                )}
                {line.lookup === "found" && (
                  <p className="text-xs text-slate-600 pl-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                    {line.productName && <span className="font-medium">{line.productName}</span>}
                    {line.warranty && (
                      <span className="inline-flex items-center gap-1 text-[#0077b6]">
                        <HiOutlineShieldCheck className="w-3.5 h-3.5" />
                        Warranty: {line.warranty}
                      </span>
                    )}
                  </p>
                )}
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">Order status</h3>
            <select
              value={form.status}
              onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              className={`w-full px-3 py-2.5 rounded-lg border text-sm font-semibold transition-colors ${statusSelectClass}`}
            >
              {ORDER_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-800">Payment method</h3>
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm((p) => ({ ...p, paymentMethod: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm bg-white"
            >
              {PAYMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {form.paymentMethod === "split" && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex justify-between text-sm font-medium mb-2">
                  <span>Cash: {form.cashPercent}%</span>
                  <span>Card (POS): {100 - form.cashPercent}%</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="99"
                  value={form.cashPercent}
                  onChange={(e) => setForm((p) => ({ ...p, cashPercent: Number(e.target.value) }))}
                  className="range range-primary range-sm w-full"
                />
              </div>
            )}

            {needsPosFields && (
              <div className="rounded-xl border border-orange-200 bg-orange-50/60 p-4 space-y-3">
                <p className="text-xs text-orange-800 font-medium">
                  POS details (optional — add if paid by card at POS)
                </p>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600 uppercase">Transaction reference</span>
                  <input
                    type="text"
                    value={pos.posTransactionRef}
                    onChange={(e) => setPos((p) => ({ ...p, posTransactionRef: e.target.value }))}
                    placeholder="From POS slip"
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm font-mono"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600 uppercase">POS machine ID</span>
                  <input
                    type="text"
                    value={pos.posMachineId}
                    onChange={(e) => setPos((p) => ({ ...p, posMachineId: e.target.value }))}
                    placeholder="e.g. POS-01"
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600 uppercase">Notes</span>
                  <textarea
                    value={pos.posNotes}
                    onChange={(e) => setPos((p) => ({ ...p, posNotes: e.target.value }))}
                    placeholder="Card type, last 4 digits..."
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-200 text-sm min-h-16"
                  />
                </label>
              </div>
            )}
          </section>

          <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
            <button
              type="button"
              disabled={loading}
              onClick={() => submit(true)}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
            >
              <HiOutlineCheckCircle className="w-5 h-5" />
              {loading ? "Saving…" : "Add Order"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
