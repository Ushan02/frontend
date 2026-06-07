import { useEffect, useState } from "react";
import axios from "axios";
import { HiOutlineXMark, HiOutlineArchiveBoxArrowDown } from "react-icons/hi2";
import { parsePositiveQuantity, sanitizeStockInput } from "../src/lib/stock";

const API = import.meta.env.VITE_BACKEND_URL + "/api/products";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function RestockModal({ open, initialProductId = "", onClose, onSuccess }) {
  const [productId, setProductId] = useState(initialProductId);
  const [quantity, setQuantity] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setProductId(initialProductId);
      setQuantity("");
      setError("");
    }
  }, [open, initialProductId]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const id = productId.trim();
    const qty = parsePositiveQuantity(quantity);

    if (!id) {
      setError("Product ID is required.");
      return;
    }
    if (qty === null) {
      setError("Quantity must be a whole number of at least 1.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.patch(
        `${API}/${id}/restock`,
        { quantity: qty },
        { headers: getAuthHeaders() }
      );
      onSuccess?.(res.data.product, res.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to restock product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Close restock form"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <HiOutlineArchiveBoxArrowDown className="w-6 h-6 text-emerald-600" />
            Restock Product
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"
            aria-label="Close"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Enter the product ID and quantity to add to the current stock.
        </p>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700 mb-1 block">Product ID</span>
            <input
              type="text"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              placeholder="e.g. LAP001"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700 mb-1 block">
              Quantity to add
            </span>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={quantity}
              onChange={(e) => setQuantity(sanitizeStockInput(e.target.value))}
              placeholder="e.g. 10"
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />
          </label>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold disabled:opacity-50"
            >
              {loading ? "Updating…" : "Add to stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
