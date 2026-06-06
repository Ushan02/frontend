import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineArrowLeft,
  HiOutlineShoppingBag,
  HiOutlineTag,
  HiOutlineShoppingCart,
  HiOutlineMinus,
  HiOutlinePlus,
  HiOutlineCheck,
  HiOutlineBolt,
} from "react-icons/hi2";
import { useCart } from "../src/context/CartContext";
import { getCategoryLabel, getSubCategoryLabel } from "../src/lib/productCategories";
import { formatPrice } from "../src/lib/formatPrice";

const API = import.meta.env.VITE_BACKEND_URL + "/api/products";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cartMsg, setCartMsg] = useState("");

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
  const stock = Number(product.stock ?? 0);
  const outOfStock = stock === 0;
  const canBuy = product.isAvailable && !outOfStock;
  const onSale = Number(product.labeledPrice) > Number(product.price);
  const discount = onSale
    ? Math.round((1 - product.price / product.labeledPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    if (outOfStock) {
      setCartMsg("This product is out of stock.");
      return;
    }
    if (!product.isAvailable) {
      setCartMsg("This product is currently unavailable.");
      return;
    }
    const result = addToCart(product, quantity);
    if (result.ok) {
      setCartMsg(`Added ${quantity} to cart!`);
      setTimeout(() => setCartMsg(""), 3000);
    } else {
      setCartMsg(result.message);
    }
  };

  const handleBuyNow = () => {
    if (outOfStock) {
      setCartMsg("This product is out of stock.");
      return;
    }
    if (!product.isAvailable) {
      setCartMsg("This product is currently unavailable.");
      return;
    }
    const result = addToCart(product, quantity);
    if (result.ok) {
      const token = localStorage.getItem("token");
      navigate(token ? "/checkout" : "/login", {
        state: token ? undefined : { from: "/checkout", message: "Please login to checkout." },
      });
    } else {
      setCartMsg(result.message);
    }
  };

  return (
    <div className="flex-1 bg-base-200 min-w-0">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 w-full min-w-0">
        <Link
          to="/products"
          className="inline-flex items-center gap-2 text-sm text-base-content/60 hover:text-primary mb-5 sm:mb-8 transition"
        >
          <HiOutlineArrowLeft className="w-4 h-4 shrink-0" />
          Back to products
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-14">
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
                    className={`shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition ${
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
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="badge badge-primary badge-outline text-xs">
                {getSubCategoryLabel(product.subCategory) || getCategoryLabel(product.category)}
              </span>
              {product.brand && (
                <span className="badge badge-outline text-xs uppercase">{product.brand}</span>
              )}
              <span className="badge badge-outline font-mono text-xs">
                {product.productId}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-base-content leading-tight break-words">
              {product.productName}
            </h1>

            {product.altNames?.length > 0 && (
              <p className="text-base-content/50 mt-2 flex items-start gap-2">
                <HiOutlineTag className="w-4 h-4 mt-0.5 shrink-0" />
                {product.altNames.join(", ")}
              </p>
            )}

            <div className="flex items-center gap-2 sm:gap-3 mt-4 sm:mt-6 flex-wrap">
              {onSale && (
                <>
                  <span className="text-lg sm:text-2xl text-base-content/40 line-through">
                    {formatPrice(product.labeledPrice)}
                  </span>
                  <span className="badge badge-error badge-sm">Save {discount}%</span>
                </>
              )}
              <span className="text-3xl sm:text-4xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
            </div>

            {product.category === "laptop" && product.specs && (
              <>
                <div className="divider my-4 sm:my-6" />
                <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content/50 mb-3">
                  Specifications
                </h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {product.specs.processorBrand && (
                    <>
                      <dt className="text-base-content/50">Processor</dt>
                      <dd>
                        {product.specs.processorBrand} {product.specs.processorModel}
                      </dd>
                    </>
                  )}
                  {product.specs.ram && (
                    <>
                      <dt className="text-base-content/50">RAM</dt>
                      <dd>{product.specs.ram} GB</dd>
                    </>
                  )}
                  {product.specs.storageType && (
                    <>
                      <dt className="text-base-content/50">Storage</dt>
                      <dd>
                        {product.specs.storageSize} GB {product.specs.storageType}
                      </dd>
                    </>
                  )}
                  {product.specs.displaySize && (
                    <>
                      <dt className="text-base-content/50">Display</dt>
                      <dd>{product.specs.displaySize}&quot;</dd>
                    </>
                  )}
                  {product.specs.gpuModel && (
                    <>
                      <dt className="text-base-content/50">Graphics</dt>
                      <dd>
                        {product.specs.gpuBrand} {product.specs.gpuModel}
                      </dd>
                    </>
                  )}
                </dl>
              </>
            )}

            <div className="divider my-4 sm:my-6" />

            <h2 className="text-sm font-semibold uppercase tracking-wide text-base-content/50 mb-2">
              Description
            </h2>
            <p className="text-base-content/80 leading-relaxed whitespace-pre-wrap">
              {product.descriptions}
            </p>

            {canBuy && (
              <div className="flex items-center gap-3 mt-6">
                <span className="text-sm font-medium text-base-content/70">Quantity</span>
                <div className="flex items-center border border-base-300 rounded-lg">
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-square"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <HiOutlineMinus className="w-4 h-4" />
                  </button>
                  <span className="w-10 text-center font-medium">{quantity}</span>
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-square"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    <HiOutlinePlus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {cartMsg && (
              <div
                className={`alert mt-4 py-2 text-sm ${
                  cartMsg.includes("Added") ? "alert-success" : "alert-warning"
                }`}
              >
                {cartMsg.includes("Added") && (
                  <HiOutlineCheck className="w-5 h-5 shrink-0" />
                )}
                <span>{cartMsg}</span>
                {cartMsg.includes("Added") && (
                  <button
                    type="button"
                    className="btn btn-sm btn-ghost"
                    onClick={() => navigate("/cart")}
                  >
                    View cart
                  </button>
                )}
              </div>
            )}

            <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-base-200 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canBuy}
                className="btn btn-primary btn-md sm:btn-lg flex-1 gap-2 min-h-12"
              >
                <HiOutlineShoppingCart className="w-5 h-5 shrink-0" />
                Add to Cart
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!canBuy}
                className="btn btn-outline btn-md sm:btn-lg flex-1 gap-2 min-h-12"
              >
                <HiOutlineBolt className="w-5 h-5 shrink-0" />
                Buy Now
              </button>
            </div>

            <p className={`text-xs mt-4 ${outOfStock ? "text-red-600 font-medium" : "text-base-content/40"}`}>
              {outOfStock
                ? "Out of stock"
                : product.isAvailable
                  ? "✓ In stock and ready to ship"
                  : "Currently unavailable"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
