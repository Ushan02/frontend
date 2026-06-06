import { useEffect, useState } from "react";
import axios from "axios";
import {
  ACCESSORY_SUB_CATEGORIES,
  LAPTOP_SUB_CATEGORIES,
  getSubCategoryLabel,
} from "../src/lib/productCategories";

const API = import.meta.env.VITE_BACKEND_URL + "/api/products/filters";

const EMPTY_FILTERS = {
  brand: [],
  processorModel: [],
  gpuModel: [],
  subCategory: [],
  minPrice: "",
  maxPrice: "",
};

function CheckboxGroup({ label, options, selected, onChange, getLabel }) {
  if (!options?.length) return null;

  const toggle = (value) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(next);
  };

  return (
    <div className="mb-5">
      <h3 className="text-sm font-semibold text-base-content mb-2">{label}</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {options.map((option) => (
          <label
            key={option}
            className="flex items-center gap-2 text-sm text-base-content/80 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => toggle(option)}
              className="checkbox checkbox-sm checkbox-primary"
            />
            <span>{getLabel ? getLabel(option) : option}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export default function ProductFilterPanel({ category, subCategory, onFilterChange }) {
  const [options, setOptions] = useState({
    brands: [],
    processorModels: [],
    gpuModels: [],
    subCategories: [],
    minPrice: 0,
    maxPrice: 0,
  });
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);

  const isAll = !category;
  const isGaming = category === "laptop" && subCategory === "gaming";
  const isBusiness = category === "laptop" && subCategory === "business_and_student";
  const isAccessories = category === "accessories";
  const showLaptopFilters = isAll || isGaming || isBusiness;
  const showGpuFilter = isAll || isGaming;

  useEffect(() => {
    setFilters(EMPTY_FILTERS);
  }, [category, subCategory]);

  useEffect(() => {
    async function loadOptions() {
      setLoading(true);
      try {
        const params = {};
        if (category) params.category = category;
        if (subCategory) params.subCategory = subCategory;

        const res = await axios.get(API, { params });
        setOptions({
          brands: res.data.brands || [],
          processorModels: res.data.processorModels || [],
          gpuModels: res.data.gpuModels || [],
          subCategories: res.data.subCategories || [],
          minPrice: res.data.minPrice ?? 0,
          maxPrice: res.data.maxPrice ?? 0,
        });
      } catch {
        setOptions({
          brands: [],
          processorModels: [],
          gpuModels: [],
          subCategories: [],
          minPrice: 0,
          maxPrice: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    loadOptions();
  }, [category, subCategory]);

  useEffect(() => {
    onFilterChange({
      brand: filters.brand,
      processorModel: filters.processorModel,
      gpuModel: filters.gpuModel,
      subCategory: filters.subCategory,
      minPrice: filters.minPrice !== "" ? filters.minPrice : undefined,
      maxPrice: filters.maxPrice !== "" ? filters.maxPrice : undefined,
    });
  }, [filters, onFilterChange]);

  const update = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const subCategoryOptions = isAccessories || isAll
    ? (options.subCategories.length
        ? options.subCategories
        : [...LAPTOP_SUB_CATEGORIES, ...ACCESSORY_SUB_CATEGORIES].map((item) => item.value))
    : [];

  return (
    <aside className="card-bg rounded-2xl border border-base-300 p-4 sm:p-5 shadow-[0_10px_36px_rgba(3,4,94,0.13)] w-full lg:w-72 shrink-0">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-extrabold text-base-content tracking-tight">Filters</h2>
        <button
          type="button"
          onClick={() => setFilters(EMPTY_FILTERS)}
          className="text-xs text-primary hover:underline"
        >
          Clear all
        </button>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-base-content/50">Loading filters…</div>
      ) : (
        <>
          {(isAccessories || isAll) && (
            <CheckboxGroup
              label="Subcategory"
              options={subCategoryOptions}
              selected={filters.subCategory}
              onChange={(value) => update("subCategory", value)}
              getLabel={(value) => getSubCategoryLabel(value)}
            />
          )}

          <CheckboxGroup
            label="Brand"
            options={options.brands}
            selected={filters.brand}
            onChange={(value) => update("brand", value)}
          />

          {showLaptopFilters && (
            <CheckboxGroup
              label="Processor"
              options={options.processorModels}
              selected={filters.processorModel}
              onChange={(value) => update("processorModel", value)}
            />
          )}

          {showGpuFilter && (
            <CheckboxGroup
              label="GPU"
              options={options.gpuModels}
              selected={filters.gpuModel}
              onChange={(value) => update("gpuModel", value)}
            />
          )}

          <div className="mb-2">
            <h3 className="text-sm font-semibold text-base-content mb-2">Price range (RS)</h3>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min="0"
                placeholder={`Min ${options.minPrice}`}
                value={filters.minPrice}
                onChange={(e) => update("minPrice", e.target.value)}
                className="input input-bordered input-sm w-full"
              />
              <input
                type="number"
                min="0"
                placeholder={`Max ${options.maxPrice}`}
                value={filters.maxPrice}
                onChange={(e) => update("maxPrice", e.target.value)}
                className="input input-bordered input-sm w-full"
              />
            </div>
          </div>
        </>
      )}
    </aside>
  );
}
