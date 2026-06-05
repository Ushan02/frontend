import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineShoppingBag,
  HiOutlineMagnifyingGlass,
  HiOutlineShoppingCart,
  HiOutlineEye,
  HiOutlineTag,
} from "react-icons/hi2";
import { useCart } from "../src/context/CartContext";

const API = import.meta.env.VITE_BACKEND_URL + "/api/products";

function StockChip({ stock, outOfStock }) {
  if (outOfStock) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-red-500/10 text-red-600 ring-1 ring-red-500/20">
        Sold out
      </span>
    );
  }

  if (stock <= 5) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/20">
        {stock} left
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/20">
      In stock
    </span>
  );
}

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const image = product.images?.[0];
  const stock = Number(product.stock ?? 0);
  const outOfStock = stock === 0;
  const canBuy = product.isAvailable && !outOfStock;
  const onSale = Number(product.labeledPrice) > Number(product.price);
  const discount = onSale
    ? Math.round((1 - product.price / product.labeledPrice) * 100)
    : 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (canBuy) addToCart(product, 1);
  };

  return (
    <article className="group relative flex flex-col w-full min-w-0 rounded-[1.75rem] bg-base-100 p-3 sm:p-4 shadow-[0_4px_24px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_48px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-300 ease-out">
      <div className="relative aspect-[4/5] sm:aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-base-200 via-base-100 to-base-300">
        <Link to={`/products/${product.productId}`} className="block h-full">
          {image ? (
            <img
              src={image}
              alt={product.productName}
              className={`w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] ${
                outOfStock ? "grayscale opacity-75" : ""
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-base-content/20">
              <HiOutlineShoppingBag className="w-16 h-16 sm:w-20 sm:h-20" />
            </div>
          )}
        </Link>

        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {outOfStock && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-red-600/95 text-white shadow-lg backdrop-blur-sm">
              Out of stock
            </span>
          )}
          {onSale && !outOfStock && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-rose-600 shadow-lg backdrop-blur-sm flex items-center gap-1">
              <HiOutlineTag className="w-3 h-3" />
              {discount}% OFF
            </span>
          )}
        </div>

        {product.images?.length > 1 && (
          <span className="absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-semibold bg-black/40 text-white backdrop-blur-md">
            +{product.images.length - 1}
          </span>
        )}

        <div className="absolute bottom-3 right-3 flex gap-2 translate-y-2 opacity-100 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-300">
          <Link
            to={`/products/${product.productId}`}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/95 text-base-content shadow-lg hover:bg-white hover:scale-105 transition-transform"
            aria-label="View product"
          >
            <HiOutlineEye className="w-5 h-5" />
          </Link>
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={!canBuy}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-content shadow-lg hover:scale-105 transition-transform disabled:opacity-50 disabled:pointer-events-none"
            aria-label="Add to cart"
          >
            <HiOutlineShoppingCart className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex flex-col flex-1 gap-3 sm:gap-4 px-1 sm:px-2 pt-4 sm:pt-5 pb-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] sm:text-[11px] font-semibold text-primary/80 uppercase tracking-[0.2em] truncate">
              {product.productId}
            </p>
            <Link to={`/products/${product.productId}`} className="block min-w-0 mt-1.5">
              <h2 className="text-base sm:text-lg font-bold leading-snug line-clamp-2 text-base-content group-hover:text-primary transition-colors">
                {product.productName}
              </h2>
            </Link>
          </div>
          <StockChip stock={stock} outOfStock={outOfStock} />
        </div>

        {product.altNames?.length > 0 && (
          <p className="text-xs text-base-content/45 line-clamp-1 -mt-1">
            {product.altNames.join(" · ")}
          </p>
        )}

        <p className="text-sm text-base-content/55 line-clamp-2 leading-relaxed flex-1">
          {product.descriptions}
        </p>

        <div className="flex items-end justify-between gap-3 pt-1 border-t border-base-200/80">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-base-content/40 font-medium mb-0.5">
              Price
            </p>
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl font-extrabold text-base-content tracking-tight">
                ${Number(product.price).toFixed(2)}
              </span>
              {onSale && (
                <span className="text-sm text-base-content/35 line-through font-medium">
                  ${Number(product.labeledPrice).toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={!canBuy}
            className={`flex-1 flex items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-semibold transition-all min-h-12 ${
              canBuy
                ? "bg-base-content text-base-100 hover:bg-primary shadow-md hover:shadow-lg"
                : "bg-base-200 text-base-content/40 cursor-not-allowed"
            }`}
          >
            <HiOutlineShoppingCart className="w-4 h-4 shrink-0" />
            {outOfStock ? "Sold out" : "Add to bag"}
          </button>
          <Link
            to={`/products/${product.productId}`}
            className="flex items-center justify-center px-4 sm:px-5 rounded-2xl border border-base-300 text-sm font-semibold text-base-content hover:border-primary hover:text-primary transition-colors min-h-12"
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(API, { headers });
        const list = Array.isArray(res.data) ? res.data : [];
        setProducts(list);
        setFiltered(list);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load products.");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  useEffect(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      setFiltered(products);
      return;
    }
    setFiltered(
      products.filter(
        (p) =>
          p.productName?.toLowerCase().includes(q) ||
          p.productId?.toLowerCase().includes(q) ||
          p.descriptions?.toLowerCase().includes(q) ||
          p.altNames?.some((n) => n.toLowerCase().includes(q))
      )
    );
  }, [search, products]);

  return (
    <div className="flex-1 bg-base-200 min-w-0">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-blue-700 text-primary-content py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 flex items-center justify-center gap-2 sm:gap-3">
            <HiOutlineShoppingBag className="w-7 h-7 sm:w-9 sm:h-9 shrink-0" />
            <span>Our Products</span>
          </h1>
          <p className="text-sm sm:text-base text-primary-content/80 max-w-xl mx-auto px-2">
            Browse our latest collection. Quality items at great prices.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 w-full min-w-0">
        {/* Search */}
        <div className="mb-5 sm:mb-8">
          <label className="input input-bordered flex items-center gap-2 w-full sm:max-w-md bg-base-100 shadow-sm min-h-12">
            <HiOutlineMagnifyingGlass className="w-5 h-5 text-base-content/40 shrink-0" />
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="grow min-w-0 text-base"
            />
          </label>
        </div>

        {error && (
          <div className="alert alert-error mb-5 sm:mb-6 w-full">
            <span className="text-sm sm:text-base">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 sm:py-24 gap-4">
            <span className="loading loading-spinner loading-lg text-primary" />
            <p className="text-base-content/50 text-sm">Loading products…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 sm:py-24 px-4">
            <HiOutlineShoppingBag className="w-14 h-14 sm:w-16 sm:h-16 mx-auto text-base-content/20 mb-4" />
            <p className="text-base sm:text-lg font-medium text-base-content/70">
              {search ? "No products match your search." : "No products available yet."}
            </p>
          </div>
        ) : (
          <>
            <p className="text-xs sm:text-sm text-base-content/50 mb-4 sm:mb-6">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              {search && ` matching "${search}"`}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-7 lg:gap-8 w-full min-w-0">
              {filtered.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
