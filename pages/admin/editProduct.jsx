import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { HiOutlineArrowLeft, HiOutlinePhoto } from "react-icons/hi2";
import {
  supabase,
  isSupabaseConfigured,
  getStorageHint,
  uniqueImagePath,
} from "../../src/lib/supabase";
import AdminProductFields, { buildSpecsPayload, getInitialSpecs } from "../../components/AdminProductFields";

const API = import.meta.env.VITE_BACKEND_URL + "/api/products";
const BUCKET = import.meta.env.VITE_SUPABASE_BUCKET || "images";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default function EditProduct() {
  const { productId } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    productName: "",
    altNames: "",
    descriptions: "",
    labeledPrice: "",
    price: "",
    stock: "",
    category: "laptop",
    subCategory: "gaming",
    brand: "",
    isAvailable: true,
    ...getInitialSpecs(),
  });
  const [existingImages, setExistingImages] = useState([]);
  const [newImageItems, setNewImageItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API}/${productId}`, {
          headers: getAuthHeaders(),
        });
        const p = res.data;
        const specs = p.specs || {};
        setForm({
          productName: p.productName ?? "",
          altNames: Array.isArray(p.altNames) ? p.altNames.join(", ") : "",
          descriptions: p.descriptions ?? "",
          labeledPrice: String(p.labeledPrice ?? ""),
          price: String(p.price ?? ""),
          stock: String(p.stock ?? 0),
          category: p.category || "laptop",
          subCategory: p.subCategory || "gaming",
          brand: p.brand || "",
          isAvailable: Boolean(p.isAvailable),
          processorBrand: specs.processorBrand || "",
          processorModel: specs.processorModel || "",
          ram: specs.ram ?? "",
          storageType: specs.storageType || "",
          storageSize: specs.storageSize ?? "",
          displaySize: specs.displaySize ?? "",
          gpuBrand: specs.gpuBrand || "",
          gpuModel: specs.gpuModel || "",
        });
        setExistingImages(Array.isArray(p.images) ? [...p.images] : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load product.");
      } finally {
        setLoading(false);
      }
    }
    if (productId) loadProduct();
  }, [productId]);

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const updateSpec = (field, value) => {
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

    setNewImageItems((prev) => [...prev, ...newItems]);
    setError("");
    e.target.value = "";
  };

  const removeNewImage = (id) => {
    setNewImageItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const removeExistingImage = (url) => {
    setExistingImages((prev) => prev.filter((u) => u !== url));
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

    const { productName, descriptions, labeledPrice, price } = form;
    if (!productName.trim() || !descriptions.trim()) {
      setError("Product name and description are required.");
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

    const totalImages = existingImages.length + newImageItems.length;
    if (totalImages === 0) {
      setError("At least one product image is required.");
      return;
    }

    setSubmitting(true);

    try {
      const newUrls = await uploadImages(newImageItems.map((i) => i.file));
      const images = [...existingImages, ...newUrls];

      const payload = {
        productName: productName.trim(),
        category: form.category,
        subCategory: form.subCategory,
        brand: form.brand.trim(),
        specs: buildSpecsPayload(form, form.subCategory),
        altNames: form.altNames
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        descriptions: descriptions.trim(),
        images,
        labeledPrice: Number(labeledPrice),
        price: Number(price),
        stock: Number(form.stock),
        isAvailable: form.isAvailable,
      };

      await axios.put(`${API}/${productId}`, payload, { headers: getAuthHeaders() });
      newImageItems.forEach((item) => URL.revokeObjectURL(item.preview));
      navigate("/admin/products");
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message ||
        "Failed to update product.";
      setError(getStorageHint(msg) ? `${msg} — ${getStorageHint(msg)}` : msg);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 text-slate-400 text-sm">
        Loading product…
      </div>
    );
  }

  if (error && !form.productName) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm mb-4">
          {error}
        </div>
        <Link to="/admin/products" className="text-blue-600 text-sm hover:underline flex items-center gap-1">
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to products
        </Link>
      </div>
    );
  }

  const allImageCount = existingImages.length + newImageItems.length;

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
          <h1 className="text-2xl font-bold text-slate-800 mt-2">Edit Product</h1>
          <p className="text-slate-500 text-sm mt-1 font-mono">{productId}</p>
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

          <label className="form-control w-full">
            <span className="label-text text-slate-600 font-medium">Product ID</span>
            <input
              type="text"
              value={productId}
              disabled
              className="input input-bordered w-full mt-1 bg-slate-50 text-slate-500"
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text text-slate-600 font-medium">Product Name *</span>
            <input
              type="text"
              value={form.productName}
              onChange={(e) => update("productName", e.target.value)}
              className="input input-bordered w-full mt-1"
              required
            />
          </label>

          <AdminProductFields form={form} update={update} updateSpec={updateSpec} />

          <label className="form-control w-full">
            <span className="label-text text-slate-600 font-medium">Alt Names</span>
            <input
              type="text"
              placeholder="Comma separated"
              value={form.altNames}
              onChange={(e) => update("altNames", e.target.value)}
              className="input input-bordered w-full mt-1"
            />
          </label>

          <label className="form-control w-full">
            <span className="label-text text-slate-600 font-medium">Description *</span>
            <textarea
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
              value={form.stock}
              onChange={(e) => update("stock", e.target.value)}
              className="input input-bordered w-full mt-1"
              required
            />
          </label>

          <div className="form-control w-full">
            <span className="label-text text-slate-600 font-medium flex items-center gap-2">
              <HiOutlinePhoto className="w-4 h-4" />
              Product Images * ({allImageCount} total)
            </span>
            <p className="text-xs text-slate-400 mt-0.5 mb-2">
              Remove existing images or add new ones. First image is the main thumbnail.
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImagesChange}
              className="file-input file-input-bordered w-full"
            />

            {(existingImages.length > 0 || newImageItems.length > 0) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                {existingImages.map((url, index) => (
                  <div key={url} className="relative group">
                    <img
                      src={url}
                      alt={`Existing ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border border-slate-200"
                    />
                    {index === 0 && newImageItems.length === 0 && (
                      <span className="absolute top-1 left-1 badge badge-primary badge-sm">
                        Main
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-1 right-1 btn btn-circle btn-xs btn-error opacity-90"
                      aria-label="Remove image"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {newImageItems.map((item, index) => (
                  <div key={item.id} className="relative group">
                    <img
                      src={item.preview}
                      alt={`New ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border border-blue-300"
                    />
                    {existingImages.length === 0 && index === 0 && (
                      <span className="absolute top-1 left-1 badge badge-primary badge-sm">
                        Main
                      </span>
                    )}
                    <span className="absolute bottom-1 left-1 badge badge-sm bg-blue-600 text-white border-0">
                      New
                    </span>
                    <button
                      type="button"
                      onClick={() => removeNewImage(item.id)}
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
                "Save Changes"
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
