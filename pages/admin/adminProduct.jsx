import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from "react-icons/hi2";

const API = import.meta.env.VITE_BACKEND_URL + "/api/products";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function AvailabilityBadge({ isAvailable }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        isAvailable ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}
    >
      {isAvailable ? "Available" : "Unavailable"}
    </span>
  );
}

function ProductImage({ src, alt }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center text-xs text-slate-400">
        No img
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="w-12 h-12 rounded-lg object-cover border border-slate-200"
      onError={() => setFailed(true)}
    />
  );
}

export default function AdminProduct() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get(API, { headers: getAuthHeaders() });
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (productId) => {
    if (!window.confirm(`Delete product "${productId}"?`)) return;

    try {
      await axios.delete(`${API}/${productId}`, { headers: getAuthHeaders() });
      setProducts((prev) => prev.filter((p) => p.productId !== productId));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete product.");
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Products</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your store inventory</p>
        </div>
        <Link
          to="/admin/products/add"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
        >
          <HiOutlinePlus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchProducts}
            className="text-red-700 underline hover:no-underline ml-4 shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
            Loading products…
          </div>
        ) : products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <p className="text-sm">No products found.</p>
            <Link to="/admin/products/add" className="text-xs mt-2 text-blue-600 hover:underline">
              Add your first product
            </Link>
          </div>
        ) : (
          <table className="w-full text-left min-w-[900px]">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">Image</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">Product ID</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">Name</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">Labeled Price</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">Price</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">Available</th>
                <th className="px-5 py-3.5 text-xs font-semibold uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-slate-50 transition">
                  <td className="px-5 py-3.5">
                    <ProductImage
                      src={product.images?.[0]}
                      alt={product.productName}
                    />
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 font-mono">
                    {product.productId}
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-slate-800">{product.productName}</p>
                    {product.altNames?.length > 0 && (
                      <p className="text-xs text-slate-400 mt-0.5">
                        {product.altNames.join(", ")}
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-sm text-slate-400 line-through">
                    ${Number(product.labeledPrice).toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-800">
                    ${Number(product.price).toFixed(2)}
                  </td>
                  <td className="px-5 py-3.5">
                    <AvailabilityBadge isAvailable={product.isAvailable} />
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-3">
                      <Link
                        to={`/admin/products/edit/${product.productId}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                      >
                        <HiOutlinePencil className="w-4 h-4" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(product.productId)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium flex items-center gap-1"
                      >
                        <HiOutlineTrash className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && products.length > 0 && (
        <p className="text-sm text-slate-400 mt-4">
          Showing {products.length} product{products.length !== 1 ? "s" : ""}
        </p>
      )}
    </div>
  );
}
