import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { HiOutlineShoppingBag } from "react-icons/hi2";
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

  useEffect(() => {
    setActiveSection(getInitialSection(searchParams));
  }, [searchParams]);

  const section =
    SHOP_SECTIONS.find((item) => item.key === activeSection) || SHOP_SECTIONS[0];

  const handleFilterChange = useCallback((nextFilters) => {
    setFilters(nextFilters);
  }, []);

  return (
    <div className="flex-1 bg-base-200 min-w-0">
      <section className="bg-gradient-to-r from-primary to-blue-700 text-primary-content py-10 sm:py-14 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-3 flex items-center justify-center gap-2 sm:gap-3">
            <HiOutlineShoppingBag className="w-7 h-7 sm:w-9 sm:h-9 shrink-0" />
            <span>Our Products</span>
          </h1>
          <p className="text-sm sm:text-base text-primary-content/80 max-w-xl mx-auto">
            Browse all laptops and accessories — use filters to narrow your search.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-10 w-full min-w-0">
        <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
          {SHOP_SECTIONS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveSection(tab.key)}
              className={`px-4 sm:px-5 py-2.5 rounded-full text-sm font-semibold transition-all min-h-11 ${
                activeSection === tab.key
                  ? "bg-primary text-primary-content shadow-md"
                  : "bg-base-100 text-base-content/70 border border-base-300 hover:border-primary hover:text-primary"
              }`}
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
          />
        </div>
      </div>
    </div>
  );
}
