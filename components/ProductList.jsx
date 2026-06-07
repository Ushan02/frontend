import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineShoppingBag,
  HiOutlineShoppingCart,
  HiOutlineEye,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineShieldCheck,
} from "react-icons/hi2";
import DiscountBadge from "./DiscountBadge";
import { useCart } from "../src/context/CartContext";
import { formatPrice } from "../src/lib/formatPrice";
import { getDiscountPercent } from "../src/lib/discount";
import { getSubCategoryLabel, getDefaultWarranty } from "../src/lib/productCategories";

const API = import.meta.env.VITE_BACKEND_URL + "/api/products";
const PAGE_SIZE = 9;

function buildQueryParams(category, subCategory, filters, page, search) {
  const params = { page, limit: PAGE_SIZE };
  if (search?.trim()) params.search = search.trim();
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
  const discount = getDiscountPercent(product.labeledPrice, product.price);
  const onSale = discount > 0;
  const specs = product.specs || {};
  const warranty = product.warranty || getDefaultWarranty(product.category);

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
      className={`card card-bg group relative flex flex-col w-full min-w-0 transition-all duration-300 ${
        compact
          ? "p-2 sm:p-2.5 shadow-[0_8px_28px_rgba(3,4,94,0.12)] hover:shadow-[0_14px_40px_rgba(3,4,94,0.18)] hover:-translate-y-0.5"
          : "p-2.5 sm:p-3 shadow-[0_10px_36px_rgba(3,4,94,0.13)] hover:shadow-[0_18px_52px_rgba(3,4,94,0.2)] hover:-translate-y-1"
      }`}
    >
      {onSale && (
        <DiscountBadge
          percent={discount}
          size={compact ? "sm" : "md"}
          className={`absolute z-20 ${compact ? "top-2 right-2" : "top-3 right-3"}`}
        />
      )}
      <div
        className={`relative overflow-hidden bg-slate-50 border border-sky/30 ${
          compact ? "aspect-[5/4] rounded-lg" : "aspect-[5/4] rounded-xl"
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
              <HiOutlineShoppingBag className={compact ? "w-10 h-10" : "w-14 h-14"} />
            </div>
          )}
        </Link>

        {!compact && (
          <div className="absolute bottom-2 right-2 flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <Link
              to={`/products/${product.productId}`}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-white/95 text-base-content shadow-lg"
            >
              <HiOutlineEye className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={!canBuy}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-content shadow-lg disabled:opacity-50"
            >
              <HiOutlineShoppingCart className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className={`flex flex-col flex-1 ${compact ? "gap-1 pt-2 px-0.5" : "gap-1.5 px-0.5 pt-2.5"}`}>
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
                ? "text-xs sm:text-sm line-clamp-2"
                : "text-sm sm:text-base line-clamp-2"
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
          <p className="text-[11px] text-base-content/60 line-clamp-1">
            {specs.processorModel}
            {specs.gpuModel ? ` · ${specs.gpuModel}` : ""}
          </p>
        )}

        {showBusinessSpecs && (
          <p className="text-[11px] text-base-content/60 line-clamp-1">
            {specs.processorModel}
            {specs.ram ? ` · ${specs.ram}GB RAM` : ""}
          </p>
        )}

        {!compact && (
          <p className="text-[10px] text-base-content/55 flex items-center gap-1">
            <HiOutlineShieldCheck className="w-3.5 h-3.5 text-primary shrink-0" />
            Warranty: {warranty}
          </p>
        )}

        <div className={`flex items-baseline flex-wrap mt-auto ${compact ? "gap-1 pt-1" : "gap-1.5 pt-1.5"}`}>
            <span className={compact ? "text-sm font-extrabold text-primary" : "text-base sm:text-lg font-extrabold text-primary"}>
              {formatPrice(product.price)}
            </span>
            {onSale && (
              <span className={compact ? "text-xs text-base-content/40 line-through" : "text-sm text-base-content/40 line-through"}>
                {formatPrice(product.labeledPrice)}
              </span>
            )}
        </div>

        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={!canBuy}
          className={`btn btn-primary mt-0.5 ${compact ? "btn-xs rounded-lg min-h-7 h-7 text-xs" : "btn-xs sm:btn-sm rounded-lg min-h-8 h-8 text-xs sm:text-sm"}`}
        >
          {outOfStock ? "Sold out" : "ADD TO CART"}
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

export default function ProductList({ category, subCategory, filters, search = "" }) {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const listRef = useRef(null);

  useEffect(() => {
    setPage(1);
  }, [category, subCategory, filters, search]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = buildQueryParams(category, subCategory, filters, page, search);
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
  }, [category, subCategory, filters, page, search]);

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
        <p className="text-base-content/70 font-medium">
          {search?.trim()
            ? `No products found for "${search.trim()}".`
            : "No products match your filters."}
        </p>
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
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
