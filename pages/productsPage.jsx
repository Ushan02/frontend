import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { HiOutlineShoppingBag, HiOutlineMagnifyingGlass, HiOutlineShoppingCart } from "react-icons/hi2";
import { useCart } from "../src/context/CartContext";

const API = import.meta.env.VITE_BACKEND_URL + "/api/products";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const image = product.images?.[0];
  const onSale = Number(product.labeledPrice) > Number(product.price);
  const discount = onSale
    ? Math.round((1 - product.price / product.labeledPrice) * 100)
    : 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.isAvailable) addToCart(product, 1);
  };

  return (
    <div className="group card bg-base-100 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-base-200/80 hover:-translate-y-1">
    <Link to={`/products/${product.productId}`} className="block">
      <figure className="relative aspect-[4/3] bg-base-200 overflow-hidden">
        {image ? (
          <img
            src={image}
            alt={product.productName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-base-content/30">
            <HiOutlineShoppingBag className="w-16 h-16" />
          </div>
        )}
        {onSale && (
          <span className="absolute top-3 left-3 badge badge-error font-semibold">
            -{discount}%
          </span>
        )}
        {product.images?.length > 1 && (
          <span className="absolute top-3 right-3 badge badge-neutral badge-sm">
            +{product.images.length - 1} photos
          </span>
        )}
      </figure>
    </Link>

      <div className="card-body p-5 gap-2">
        <p className="text-xs text-base-content/50 font-mono uppercase tracking-wide">
          {product.productId}
        </p>
        <h2 className="card-title text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {product.productName}
        </h2>
        {product.altNames?.length > 0 && (
          <p className="text-xs text-base-content/50 line-clamp-1">
            {product.altNames.join(" · ")}
          </p>
        )}
        <p className="text-sm text-base-content/60 line-clamp-2 flex-1">
          {product.descriptions}
        </p>
        <div className="flex items-end justify-between pt-2 mt-auto gap-2">
          <div>
            {onSale && (
              <p className="text-sm text-base-content/40 line-through">
                ${Number(product.labeledPrice).toFixed(2)}
              </p>
            )}
            <p className="text-xl font-bold text-primary">
              ${Number(product.price).toFixed(2)}
            </p>
          </div>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={!product.isAvailable}
              className="btn btn-primary btn-sm btn-square"
              title="Add to cart"
            >
              <HiOutlineShoppingCart className="w-4 h-4" />
            </button>
            <Link to={`/products/${product.productId}`} className="btn btn-outline btn-sm">
              View
            </Link>
          </div>
        </div>
      </div>
    </div>
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
    <div className="flex-1 bg-gradient-to-b from-base-200/50 to-base-100">
      {/* Hero */}
      <section className="bg-gradient-to-r from-primary to-blue-700 text-primary-content py-14 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 flex items-center justify-center gap-3">
            <HiOutlineShoppingBag className="w-9 h-9" />
            Our Products
          </h1>
          <p className="text-primary-content/80 max-w-xl mx-auto">
            Browse our latest collection. Quality items at great prices.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {/* Search */}
        <div className="mb-8">
          <label className="input input-bordered flex items-center gap-2 max-w-md mx-auto sm:mx-0 bg-base-100 shadow-sm">
            <HiOutlineMagnifyingGlass className="w-5 h-5 text-base-content/40" />
            <input
              type="search"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="grow"
            />
          </label>
        </div>

        {error && (
          <div className="alert alert-error mb-6 max-w-2xl">
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="loading loading-spinner loading-lg text-primary" />
            <p className="text-base-content/50 text-sm">Loading products…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <HiOutlineShoppingBag className="w-16 h-16 mx-auto text-base-content/20 mb-4" />
            <p className="text-lg font-medium text-base-content/70">
              {search ? "No products match your search." : "No products available yet."}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-base-content/50 mb-6">
              {filtered.length} product{filtered.length !== 1 ? "s" : ""}
              {search && ` matching "${search}"`}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
