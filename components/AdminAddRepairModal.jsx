import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { HiOutlineXMark, HiOutlineWrenchScrewdriver } from "react-icons/hi2";
import { API_BASE, getAuthHeaders } from "../src/lib/adminApi";
import {
  CUSTOMER_ID_HINT,
  formatCustomerIdInput,
  isValidCustomerId,
  normalizeCustomerId,
} from "../src/lib/customerId";

const REPAIR_API = API_BASE + "/api/repairs";

function todayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

export default function AdminAddRepairModal({ open, onClose, onSuccess }) {
  const [customerId, setCustomerId] = useState("");
  const [lookupState, setLookupState] = useState("idle");
  const [customer, setCustomer] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedKey, setSelectedKey] = useState("");
  const [getDate, setGetDate] = useState(todayInputValue());
  const [receiveDate, setReceiveDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const lookupTimer = useRef(null);

  useEffect(() => {
    if (!open) return;
    setCustomerId("");
    setLookupState("idle");
    setCustomer(null);
    setProducts([]);
    setSelectedKey("");
    setGetDate(todayInputValue());
    setReceiveDate("");
    setNotes("");
    setError("");
  }, [open]);

  useEffect(() => {
    return () => {
      if (lookupTimer.current) clearTimeout(lookupTimer.current);
    };
  }, []);

  const lookupCustomer = async (rawId) => {
    const normalized = normalizeCustomerId(rawId);
    if (!isValidCustomerId(normalized)) {
      setLookupState("invalid");
      setCustomer(null);
      setProducts([]);
      setSelectedKey("");
      return;
    }

    setLookupState("loading");
    setError("");
    try {
      const res = await axios.get(`${REPAIR_API}/customer-lookup`, {
        params: { customerId: normalized },
        headers: getAuthHeaders(),
      });
      setCustomer(res.data.customer);
      setProducts(Array.isArray(res.data.purchasedProducts) ? res.data.purchasedProducts : []);
      setSelectedKey("");
      setLookupState("found");
    } catch (err) {
      setCustomer(null);
      setProducts([]);
      setSelectedKey("");
      setLookupState("not_found");
      setError(err.response?.data?.message || "Customer not found.");
    }
  };

  const handleCustomerIdChange = (value) => {
    const formatted = formatCustomerIdInput(value);
    setCustomerId(formatted);
    setError("");
    if (lookupTimer.current) clearTimeout(lookupTimer.current);
    lookupTimer.current = setTimeout(() => lookupCustomer(formatted), 450);
  };

  if (!open) return null;

  const selectedProduct = products.find(
    (item) => `${item.orderId}::${item.productId}` === selectedKey
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isValidCustomerId(customerId)) {
      setError(CUSTOMER_ID_HINT);
      return;
    }
    if (!selectedProduct) {
      setError("Select a purchased product for repair.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        REPAIR_API,
        {
          customerId,
          orderId: selectedProduct.orderId,
          productId: selectedProduct.productId,
          getDate,
          receiveDate: receiveDate || null,
          notes,
        },
        { headers: getAuthHeaders() }
      );
      onSuccess?.(res.data.repair);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create repair record.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[90dvh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-slate-200">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-slate-200 bg-white">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <HiOutlineWrenchScrewdriver className="w-5 h-5 text-[#0077b6]" />
            Add repair
          </h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100">
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <p className="text-sm text-slate-500">
            Repair ID is generated automatically when you save.
          </p>

          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Customer ID *</label>
            <input
              type="text"
              value={customerId}
              onChange={(e) => handleCustomerIdChange(e.target.value)}
              placeholder="1999236512V"
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
            <p className="text-xs text-slate-400 mt-1">{CUSTOMER_ID_HINT}</p>
            {lookupState === "loading" && (
              <p className="text-xs text-slate-500 mt-2">Looking up customer…</p>
            )}
            {lookupState === "found" && customer && (
              <p className="text-sm text-emerald-700 mt-2">
                {customer.firstName} {customer.lastName} · {customer.email}
              </p>
            )}
            {lookupState === "not_found" && (
              <p className="text-sm text-red-600 mt-2">No customer found for this ID.</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Purchased product *
            </label>
            <select
              value={selectedKey}
              onChange={(e) => setSelectedKey(e.target.value)}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
              disabled={products.length === 0}
            >
              <option value="">
                {products.length === 0 ? "Enter customer ID first" : "Select product to repair"}
              </option>
              {products.map((item) => {
                const key = `${item.orderId}::${item.productId}`;
                return (
                  <option key={key} value={key}>
                    {item.productName} ({item.productId}) — Order {item.orderId}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Get date (received for repair) *
              </label>
              <input
                type="date"
                value={getDate}
                onChange={(e) => setGetDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Receive date (returned to customer)
              </label>
              <input
                type="date"
                value={receiveDate}
                onChange={(e) => setReceiveDate(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="Repair issue, parts replaced, etc."
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2.5 rounded-lg bg-[#0077b6] hover:bg-[#03045e] disabled:opacity-60 text-white text-sm font-semibold"
            >
              {loading ? "Saving…" : "Create repair"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
