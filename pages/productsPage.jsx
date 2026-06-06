import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { HiOutlineShoppingBag, HiOutlineMagnifyingGlass, HiOutlineXMark } from "react-icons/hi2";
import ProductFilterPanel from "../components/ProductFilterPanel";
import ProductList from "../components/ProductList";
import { SHOP_SECTIONS } from "../src/lib/productCategories";

function getInitialSection(searchParams) {
  const key = searchParams.get("section");
  return SHOP_SECTIONS.some((s) => s.key === key) ? key : "all";
}

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState(() =>
    getInitialSection(searchParams)
  );
  const [filters, setFilters] = useState({});
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput.trim()), 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    setActiveSection(getInitialSection(searchParams));
  }, [searchParams]);

  const section =
    SHOP_SECTIONS.find((item) => item.key === activeSection) || SHOP_SECTIONS[0];

  const handleFilterChange = useCallback((nextFilters) => {
    setFilters(nextFilters);
  }, []);

  return (
    <div className="page-shell flex-1 min-w-0">
      <section className="page-hero py-12 sm:py-16 px-4 sm:px-6">
        <div className="page-hero-inner max-w-7xl mx-auto text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 border border-white/20 mb-4">
            <HiOutlineShoppingBag className="w-3.5 h-3.5" />
            Shop
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-2 sm:mb-3 flex items-center justify-center gap-2 sm:gap-3">
            <HiOutlineShoppingBag className="w-7 h-7 sm:w-9 sm:h-9 shrink-0" />
            <span>Our Products</span>
          </h1>
          <p className="text-sm sm:text-base text-white/80 max-w-xl mx-auto">
            Browse all laptops and accessories — search by ID or name, then filter results.
          </p>
        </div>
      </section>

      <div className="page-container py-6 sm:py-10 w-full min-w-0">
        <div className="relative mb-6">
          <HiOutlineMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/35 pointer-events-none" />
          <input
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by product ID or name…"
            className="search-field"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => setSearchInput("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl hover:bg-mist text-base-content/45 transition"
              aria-label="Clear search"
            >
              <HiOutlineXMark className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
          {SHOP_SECTIONS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveSection(tab.key)}
              className={`pill-tab ${activeSection === tab.key ? "pill-tab-active" : ""}`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          <ProductFilterPanel
            category={section.category}
            subCategory={section.subCategory}
            onFilterChange={handleFilterChange}
          />
          <ProductList
            category={section.category}
            subCategory={section.subCategory}
            filters={filters}
            search={searchQuery}
          />
        </div>
      </div>
    </div>
  );
}
