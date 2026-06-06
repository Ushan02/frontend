import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineShoppingBag,
  HiOutlineShoppingCart,
  HiOutlineEye,
  HiOutlineTag,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";
import { useCart } from "../src/context/CartContext";
import { formatPrice } from "../src/lib/formatPrice";
import { getSubCategoryLabel } from "../src/lib/productCategories";

const API = import.meta.env.VITE_BACKEND_URL + "/api/products";
const PAGE_SIZE = 9;

function buildQueryParams(category, subCategory, filters, page) {
  const params = { page, limit: PAGE_SIZE };
  if (category) params.category = category;
  if (filters.subCategory?.length) {
    params.subCategory = filters.subCategory.join(",");
  } else if (subCategory) {
    params.subCategory = subCategory;
  }
  if (filters.brand?.length) params.brand = filters.brand.join(",");
  if (filters.processorModel?.length) params.processorModel = filters.processorModel.join(",");
  if (filters.gpuModel?.length) params.gpuModel = filters.gpuModel.join(",");
  if (filters.minPrice !== undefined && filters.minPrice !== "")
    params.minPrice = filters.minPrice;
  if (filters.maxPrice !== undefined && filters.maxPrice !== "")
    params.maxPrice = filters.maxPrice;
  return params;
}

export function ProductCard({ product, variant, compact = false }) {
  const { addToCart } = useCart();
  const image = product.images?.[0];
  const stock = Number(product.stock ?? 0);
  const outOfStock = stock === 0;
  const canBuy = product.isAvailable && !outOfStock;
  const onSale = Number(product.labeledPrice) > Number(product.price);
  const discount = onSale
    ? Math.round((1 - product.price / product.labeledPrice) * 100)
    : 0;
  const specs = product.specs || {};

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (canBuy) addToCart(product, 1);
  };

  const showGamingSpecs =
    !compact && (variant === "gaming" || product.subCategory === "gaming") && specs.processorModel;
  const showBusinessSpecs =
    !compact &&
    (variant === "business_and_student" || product.subCategory === "business_and_student") &&
    specs.processorModel;

  return (
    <article
      className={`group flex flex-col w-full min-w-0 bg-base-100 transition-all duration-300 ${
        compact
          ? "rounded-2xl p-2.5 sm:p-3 shadow-[0_3px_16px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_32px_rgba(15,23,42,0.1)] hover:-translate-y-0.5"
          : "rounded-[1.75rem] p-3 sm:p-4 shadow-[0_4px_24px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_48px_rgba(15,23,42,0.12)] hover:-translate-y-1"
      }`}
    >
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-base-200 to-base-300 ${
          compact ? "aspect-[4/3] rounded-xl" : "aspect-square rounded-2xl"
        }`}
      >
        <Link to={`/products/${product.productId}`} className="block h-full">
          {image ? (
            <img
              src={image}
              alt={product.productName}
              className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06] ${
                outOfStock ? "grayscale opacity-75" : ""
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-base-content/20">
              <HiOutlineShoppingBag className={compact ? "w-12 h-12" : "w-16 h-16"} />
            </div>
          )}
        </Link>

        {onSale && !outOfStock && (
          <span
            className={`absolute font-bold bg-white/90 text-rose-600 shadow-lg flex items-center gap-1 ${
              compact
                ? "top-2 left-2 px-1.5 py-0.5 rounded-full text-[9px]"
                : "top-3 left-3 px-2.5 py-1 rounded-full text-[10px]"
            }`}
          >
            <HiOutlineTag className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
            {discount}% OFF
          </span>
        )}

        {!compact && (
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <Link
              to={`/products/${product.productId}`}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/95 text-base-content shadow-lg"
            >
              <HiOutlineEye className="w-5 h-5" />
            </Link>
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={!canBuy}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-content shadow-lg disabled:opacity-50"
            >
              <HiOutlineShoppingCart className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      <div className={`flex flex-col flex-1 ${compact ? "gap-1.5 pt-2.5 px-0.5" : "gap-2 px-1 pt-4"}`}>
        <p
          className={`font-semibold text-primary/80 uppercase tracking-widest ${
            compact ? "text-[10px]" : "text-[10px]"
          }`}
        >
          {product.brand}
        </p>
        <Link to={`/products/${product.productId}`}>
          <h2
            className={`font-bold group-hover:text-primary transition-colors ${
              compact
                ? "text-sm sm:text-base line-clamp-2"
                : "text-base sm:text-lg line-clamp-2"
            }`}
          >
            {product.productName}
          </h2>
        </Link>

        {compact ? (
          <p className="text-[9px] text-base-content/45 uppercase tracking-wide line-clamp-1">
            {getSubCategoryLabel(product.subCategory)}
          </p>
        ) : (
          <p className="text-[10px] text-base-content/45 uppercase tracking-wide">
            {getSubCategoryLabel(product.subCategory)}
          </p>
        )}

        {showGamingSpecs && (
          <p className="text-xs text-base-content/60">
            {specs.processorModel}
            {specs.gpuModel ? ` · ${specs.gpuModel}` : ""}
          </p>
        )}

        {showBusinessSpecs && (
          <p className="text-xs text-base-content/60">
            {specs.processorModel}
            {specs.ram ? ` · ${specs.ram}GB RAM` : ""}
          </p>
        )}

        <div className={`flex items-baseline mt-auto ${compact ? "gap-1.5 pt-1.5" : "gap-2 pt-2"}`}>
          <span className={compact ? "text-base font-extrabold" : "text-lg sm:text-xl font-extrabold"}>
            {formatPrice(product.price)}
          </span>
          {onSale && (
            <span className={compact ? "text-xs text-base-content/35 line-through" : "text-sm text-base-content/35 line-through"}>
              {formatPrice(product.labeledPrice)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={!canBuy}
          className={`btn btn-primary mt-0.5 ${compact ? "btn-sm rounded-xl min-h-8 h-8" : "btn-sm rounded-xl mt-1"}`}
        >
          {outOfStock ? "Sold out" : "Add to bag"}
        </button>
      </div>
    </article>
  );
}

function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);

  for (let i = start; i <= end; i += 1) {
    pages.push(i);
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 mt-8">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="btn btn-sm btn-outline gap-1 min-w-[2.5rem]"
        aria-label="Previous page"
      >
        <HiOutlineChevronLeft className="w-4 h-4" />
        Prev
      </button>

      {start > 1 && (
        <>
          <button
            type="button"
            onClick={() => onPageChange(1)}
            className="btn btn-sm btn-ghost min-w-[2.5rem]"
          >
            1
          </button>
          {start > 2 && <span className="text-base-content/40 px-1">…</span>}
        </>
      )}

      {pages.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onPageChange(n)}
          className={`btn btn-sm min-w-[2.5rem] ${
            n === page ? "btn-primary" : "btn-ghost"
          }`}
        >
          {n}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="text-base-content/40 px-1">…</span>}
          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            className="btn btn-sm btn-ghost min-w-[2.5rem]"
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="btn btn-sm btn-outline gap-1 min-w-[2.5rem]"
        aria-label="Next page"
      >
        Next
        <HiOutlineChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function ProductList({ category, subCategory, filters }) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    setPage(1);
  }, [category, subCategory, filters]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = buildQueryParams(category, subCategory, filters, page);
      const res = await axios.get(API, { headers, params });

      if (Array.isArray(res.data)) {
        setProducts(res.data);
        setTotal(res.data.length);
        setTotalPages(1);
      } else {
        setProducts(res.data.products || []);
        setTotal(res.data.total ?? 0);
        setTotalPages(res.data.totalPages ?? 1);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products.");
      setProducts([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [category, subCategory, filters, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handlePageChange = (nextPage) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4 flex-1">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-base-content/50 text-sm">Loading products…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error flex-1">
        <span>{error}</span>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16 flex-1">
        <HiOutlineShoppingBag className="w-14 h-14 mx-auto text-base-content/20 mb-4" />
        <p className="text-base-content/70 font-medium">No products match your filters.</p>
      </div>
    );
  }

  return (
    <div ref={listRef} className="flex-1 min-w-0">
      <p className="text-xs sm:text-sm text-base-content/50 mb-4">
        Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} of {total}{" "}
        product{total !== 1 ? "s" : ""}
        {totalPages > 1 && ` · Page ${page} of ${totalPages}`}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            variant={subCategory || product.subCategory || "all"}
          />
        ))}
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
    </div>
  );
}
