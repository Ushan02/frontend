import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineArrowLeft,
  HiOutlineShoppingBag,
  HiOutlineTag,
} from "react-icons/hi2";

const API = import.meta.env.VITE_BACKEND_URL + "/api/products";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProduct() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${API}/${productId}`, { headers });
        setProduct(res.data);
        setActiveImage(0);
      } catch (err) {
        setError(err.response?.data?.message || "Product not found.");
      } finally {
        setLoading(false);
      }
    }
    if (productId) fetchProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 px-6">
        <p className="text-lg text-base-content/70">{error || "Product not found."}</p>
        <Link to="/products" className="btn btn-primary gap-2">
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to products
        </Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [];
  const onSale = Number(product.labeledPrice) > Number(product.price);
  const discount = onSale
    ? Math.round((1 - product.price / product.labeledPrice) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-base-200/40 to-base-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-base-content/60 hover:text-primary mb-8 transition"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Gallery */}
          <div className="space-y-4">
            <div className="card bg-base-100 shadow-xl overflow-hidden border border-base-200/80">
              <figure className="aspect-square bg-base-200">
                {images[activeImage] ? (
                  <img
                    src={images[activeImage]}
                    alt={product.productName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <HiOutlineShoppingBag className="w-24 h-24 text-base-content/20" />
                  </div>
                )}
              </figure>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                      activeImage === i
                        ? "border-primary ring-2 ring-primary/30"
                        : "border-base-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <span className="badge badge-outline font-mono text-xs mb-3 w-fit">
              {product.productId}
            </span>

            <h1 className="text-3xl sm:text-4xl font-bold text-base-content leading-tight">
              {product.productName}
            </h1>

            {product.altNames?.length > 0 && (
              <p className="text-base-content/50 mt-2 flex items-start gap-2">
                <HiOutlineTag className="w-4 h-4 mt-0.5 shrink-0" />
                {product.altNames.join(", ")}
              </p>
            )}

            <div className="flex items-center gap-3 mt-6 flex-wrap">
              {onSale && (
                <>
                  <span className="text-2xl text-base-content/40 line-through">
                    ${Number(product.labeledPrice).toFixed(2)}
                  </span>
                  <span className="badge badge-error">Save {discount}%</span>
                </>
              )}
              <span className="text-4xl font-bold text-primary">
                ${Number(product.price).toFixed(2)}
              </span>
            </div>

            <div className="divider my-6" />

            <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content/50 mb-2">
              Description
            </h2>
            <p className="text-base-content/80 leading-relaxed whitespace-pre-wrap">
              {product.descriptions}
            </p>

            <div className="mt-8 pt-6 border-t border-base-200 flex flex-col sm:flex-row gap-3">
              <button type="button" className="btn btn-primary btn-lg flex-1">
                Add to Cart
              </button>
              <Link to="/products" className="btn btn-outline btn-lg">
                Continue Shopping
              </Link>
            </div>

            <p className="text-xs text-base-content/40 mt-4">
              {product.isAvailable
                ? "✓ In stock and ready to ship"
                : "Currently unavailable"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
