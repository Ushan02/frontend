import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { HiOutlineArrowLeft, HiOutlinePhoto } from "react-icons/hi2";
import {
  supabase,
  isSupabaseConfigured,
  getStorageHint,
  uniqueImagePath,
} from "../../src/lib/supabase";
import { PRODUCT_CATEGORIES } from "../../src/lib/productCategories";

const API = import.meta.env.VITE_BACKEND_URL + "/api/products";
const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || "images";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

const initialForm = {
  productId: "",
  productName: "",
  altNames: "",
  descriptions: "",
  labeledPrice: "",
  price: "",
  stock: "",
  category: "accessories",
  isAvailable: true,
};

export default function AddProduct() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [imageItems, setImageItems] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const revokeAllPreviews = (items) => {
    items.forEach((item) => URL.revokeObjectURL(item.preview));
  };

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const newItems = files.map((file) => ({
      id: `${Date.now()}-${file.name}-${Math.random()}`,
      file,
      preview: URL.createObjectURL(file),
    }));

    setImageItems((prev) => [...prev, ...newItems]);
    setError("");
    e.target.value = "";
  };

  const removeImage = (id) => {
    setImageItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  async function uploadImages(files) {
    if (!isSupabaseConfigured) {
      throw new Error("Supabase is not configured. Add env vars to upload images.");
    }

    const urls = [];

    for (const file of files) {
      const filePath = uniqueImagePath(file.name, "products");
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(filePath, file, {
          upsert: false,
          contentType: file.type || "image/jpeg",
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      urls.push(data.publicUrl);
    }

    return urls;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const { productId, productName, descriptions, labeledPrice, price } = form;
    if (!productId.trim() || !productName.trim() || !descriptions.trim()) {
      setError("Product ID, name, and description are required.");
      return;
    }
    if (!labeledPrice || !price) {
      setError("Labeled price and price are required.");
      return;
    }
    if (form.stock === "" || Number(form.stock) < 0) {
      setError("Stock is required and must be 0 or greater.");
      return;
    }
    if (imageItems.length === 0) {
      setError("Please upload at least one product image.");
      return;
    }

    setSubmitting(true);

    try {
      const images = await uploadImages(imageItems.map((i) => i.file));

      const payload = {
        productId: productId.trim(),
        productName: productName.trim(),
        altNames: form.altNames
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        descriptions: descriptions.trim(),
        images,
        labeledPrice: Number(labeledPrice),
        price: Number(price),
        stock: Number(form.stock),
        category: form.category,
        isAvailable: form.isAvailable,
      };

      await axios.post(API, payload, { headers: getAuthHeaders() });
      revokeAllPreviews(imageItems);
      navigate("/admin/products");
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to add product.";
      setError(getStorageHint(msg) ? `${msg} — ${getStorageHint(msg)}` : msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full flex justify-center items-start py-8 px-4 sm:px-6">
      <div className="w-full max-w-3xl">
        <div className="mb-6 text-center sm:text-left">
          <Link
            to="/admin/products"
            className="text-sm text-slate-500 hover:text-slate-800 transition flex items-center gap-1 w-fit"
          >
            <HiOutlineArrowLeft className="w-4 h-4" />
            Back to products
          </Link>
          <h1 className="text-2xl font-bold text-slate-800 mt-2">Add Product</h1>
          <p className="text-slate-500 text-sm mt-1">Create a new product in your store</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5 w-full"
        >
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="form-control w-full">
              <span className="label-text text-slate-600 font-medium">Product ID *</span>
              <input
                type="text"
                placeholder="PRD-009"
                value={form.productId}
                onChange={(e) => update("productId", e.target.value)}
                className="input input-bordered w-full mt-1"
                required
              />
            </label>

            <label className="form-control w-full">
              <span className="label-text text-slate-600 font-medium">Product Name *</span>
              <input
                type="text"
                placeholder="Wireless Headphones"
                value={form.productName}
                onChange={(e) => update("productName", e.target.value)}
                className="input input-bordered w-full mt-1"
                required
              />
            </label>
          </div>

          <label className="form-control w-full">
            <span className="label-text text-slate-600 font-medium">Category *</span>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="select select-bordered w-full mt-1"
              required
            >
              {PRODUCT_CATEGORIES.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>

          <label className="form-control w-full">
            <span className="label-text text-slate-600 font-medium">Alt Names</span>
            <input
              type="text"
              placeholder="BT Headphones, Earphones (comma separated)"
              value={form.altNames}
              onChange={(e) => update("altNames", e.target.value)}
              className="input input-bordered w-full mt-1"
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text text-slate-600 font-medium">Description *</span>
            <textarea
              placeholder="Product description..."
              value={form.descriptions}
              onChange={(e) => update("descriptions", e.target.value)}
              className="textarea textarea-bordered w-full mt-1 min-h-24"
              required
            />
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="form-control w-full">
              <span className="label-text text-slate-600 font-medium">Labeled Price (RS) *</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="99.99"
                value={form.labeledPrice}
                onChange={(e) => update("labeledPrice", e.target.value)}
                className="input input-bordered w-full mt-1"
                required
              />
            </label>

            <label className="form-control w-full">
              <span className="label-text text-slate-600 font-medium">Price (RS) *</span>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="79.99"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                className="input input-bordered w-full mt-1"
                required
              />
            </label>
          </div>

          <label className="form-control w-full">
            <span className="label-text text-slate-600 font-medium">Stock *</span>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="100"
              value={form.stock}
              onChange={(e) => update("stock", e.target.value)}
              className="input input-bordered w-full mt-1"
              required
            />
          </label>

          <div className="form-control w-full">
            <span className="label-text text-slate-600 font-medium flex items-center gap-2">
              <HiOutlinePhoto className="w-4 h-4" />
              Product Images * ({imageItems.length} selected)
            </span>
            <p className="text-xs text-slate-400 mt-0.5 mb-2">
              Select multiple images. First image is used as the main thumbnail in the product list.
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
              className="file-input file-input-bordered w-full"
            />

            {imageItems.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                {imageItems.map((item, index) => (
                  <div key={item.id} className="relative group">
                    <img
                      src={item.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border border-slate-200"
                    />
                    {index === 0 && (
                      <span className="absolute top-1 left-1 badge badge-primary badge-sm">
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(item.id)}
                      className="absolute top-1 right-1 btn btn-circle btn-xs btn-error opacity-90"
                      aria-label="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="flex items-center justify-center sm:justify-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(e) => update("isAvailable", e.target.checked)}
              className="checkbox checkbox-primary"
            />
            <span className="text-sm text-slate-700">Available for sale</span>
          </label>

          <div className="flex flex-col sm:flex-row gap-3 pt-2 justify-center sm:justify-start">
            <button type="submit" disabled={submitting} className="btn btn-primary">
              {submitting ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Saving…
                </>
              ) : (
                "Add Product"
              )}
            </button>
            <Link to="/admin/products" className="btn btn-ghost">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
