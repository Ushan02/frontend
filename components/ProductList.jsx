import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineShoppingBag,
  HiOutlineShoppingCart,
  HiOutlineEye,
  HiOutlineTag,
} from "react-icons/hi2";
import { useCart } from "../src/context/CartContext";
import { formatPrice } from "../src/lib/formatPrice";
import { getSubCategoryLabel } from "../src/lib/productCategories";

const API = import.meta.env.VITE_BACKEND_URL + "/api/products";

function buildQueryParams(category, subCategory, filters) {
  const params = {};
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

function ProductCard({ product, variant }) {
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

  return (
    <article className="group flex flex-col w-full min-w-0 rounded-[1.75rem] bg-base-100 p-3 sm:p-4 shadow-[0_4px_24px_rgba(15,23,42,0.06)] hover:shadow-[0_20px_48px_rgba(15,23,42,0.12)] hover:-translate-y-1 transition-all duration-300">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-base-200 to-base-300">
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
              <HiOutlineShoppingBag className="w-16 h-16" />
            </div>
          )}
        </Link>

        {onSale && !outOfStock && (
          <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/90 text-rose-600 shadow-lg flex items-center gap-1">
            <HiOutlineTag className="w-3 h-3" />
            {discount}% OFF
          </span>
        )}

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
      </div>

      <div className="flex flex-col flex-1 gap-2 px-1 pt-4">
        <p className="text-[10px] font-semibold text-primary/80 uppercase tracking-widest">
          {product.brand}
        </p>
        <Link to={`/products/${product.productId}`}>
          <h2 className="text-base sm:text-lg font-bold line-clamp-2 group-hover:text-primary transition-colors">
            {product.productName}
          </h2>
        </Link>

        <p className="text-[10px] text-base-content/45 uppercase tracking-wide">
          {getSubCategoryLabel(product.subCategory)}
        </p>

        {(variant === "gaming" || product.subCategory === "gaming") && specs.processorModel && (
          <p className="text-xs text-base-content/60">
            {specs.processorModel}
            {specs.gpuModel ? ` · ${specs.gpuModel}` : ""}
          </p>
        )}

        {(variant === "business_and_student" || product.subCategory === "business_and_student") &&
          specs.processorModel && (
          <p className="text-xs text-base-content/60">
            {specs.processorModel}
            {specs.ram ? ` · ${specs.ram}GB RAM` : ""}
          </p>
        )}

        <div className="flex items-baseline gap-2 mt-auto pt-2">
          <span className="text-lg sm:text-xl font-extrabold">{formatPrice(product.price)}</span>
          {onSale && (
            <span className="text-sm text-base-content/35 line-through">
              {formatPrice(product.labeledPrice)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleQuickAdd}
          disabled={!canBuy}
          className="btn btn-sm btn-primary rounded-xl mt-1"
        >
          {outOfStock ? "Sold out" : "Add to bag"}
        </button>
      </div>
    </article>
  );
}

export default function ProductList({ category, subCategory, filters }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = buildQueryParams(category, subCategory, filters);
      const res = await axios.get(API, { headers, params });
      setProducts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load products.");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [category, subCategory, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

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
    <div className="flex-1 min-w-0">
      <p className="text-xs sm:text-sm text-base-content/50 mb-4">
        {products.length} product{products.length !== 1 ? "s" : ""}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            variant={subCategory || product.subCategory || "all"}
          />
        ))}
      </div>
    </div>
  );
}
