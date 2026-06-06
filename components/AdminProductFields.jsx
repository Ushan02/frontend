import {
  PRODUCT_CATEGORIES,
  LAPTOP_SUB_CATEGORIES,
  ACCESSORY_SUB_CATEGORIES,
  GAMING_SPECS,
  BUSINESS_SPECS,
} from "../src/lib/productCategories";

const EMPTY_SPECS = {
  processorBrand: "",
  processorModel: "",
  ram: "",
  storageType: "",
  storageSize: "",
  displaySize: "",
  gpuBrand: "",
  gpuModel: "",
};

export function getInitialSpecs() {
  return { ...EMPTY_SPECS };
}

export function buildSpecsPayload(form, subCategory) {
  if (subCategory !== "gaming" && subCategory !== "business_and_student") {
    return {};
  }

  const specs = {
    processorBrand: form.processorBrand || null,
    processorModel: form.processorModel || null,
    ram: form.ram !== "" ? Number(form.ram) : null,
    storageType: form.storageType || null,
    storageSize: form.storageSize !== "" ? Number(form.storageSize) : null,
    displaySize: form.displaySize !== "" ? Number(form.displaySize) : null,
    gpuBrand: null,
    gpuModel: null,
  };

  if (subCategory === "gaming") {
    specs.gpuBrand = form.gpuBrand || null;
    specs.gpuModel = form.gpuModel || null;
  }

  return specs;
}

function SpecSelect({ label, value, onChange, options, required }) {
  return (
    <label className="form-control w-full">
      <span className="label-text text-slate-600 font-medium">
        {label} {required ? "*" : ""}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="select select-bordered w-full mt-1"
        required={required}
      >
        <option value="">Select…</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function AdminProductFields({ form, update, updateSpec }) {
  const isLaptop = form.category === "laptop";
  const isGaming = form.subCategory === "gaming";
  const isBusiness = form.subCategory === "business_and_student";
  const specConfig = isGaming ? GAMING_SPECS : isBusiness ? BUSINESS_SPECS : null;

  const subCategoryOptions =
    form.category === "laptop" ? LAPTOP_SUB_CATEGORIES : ACCESSORY_SUB_CATEGORIES;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="form-control w-full">
          <span className="label-text text-slate-600 font-medium">Category *</span>
          <select
            value={form.category}
            onChange={(e) => {
              const category = e.target.value;
              update("category", category);
              update("subCategory", category === "laptop" ? "gaming" : "memory");
            }}
            className="select select-bordered w-full mt-1"
            required
          >
            {PRODUCT_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-control w-full">
          <span className="label-text text-slate-600 font-medium">Subcategory *</span>
          <select
            value={form.subCategory}
            onChange={(e) => update("subCategory", e.target.value)}
            className="select select-bordered w-full mt-1"
            required
          >
            {subCategoryOptions.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="form-control w-full">
        <span className="label-text text-slate-600 font-medium">Brand *</span>
        <input
          type="text"
          placeholder="ASUS"
          value={form.brand}
          onChange={(e) => update("brand", e.target.value.toUpperCase())}
          className="input input-bordered w-full mt-1 uppercase"
          required
        />
        <span className="text-xs text-slate-400 mt-1">Stored in uppercase. Appears in filters automatically.</span>
      </label>

      {isLaptop && specConfig && (
        <div className="rounded-xl border border-slate-200 p-4 space-y-4 bg-slate-50">
          <h3 className="font-semibold text-slate-800">Laptop specifications</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SpecSelect
              label="Processor brand"
              value={form.processorBrand}
              onChange={(v) => updateSpec("processorBrand", v)}
              options={specConfig.processorBrands}
              required
            />
            <SpecSelect
              label="Processor model"
              value={form.processorModel}
              onChange={(v) => updateSpec("processorModel", v)}
              options={specConfig.processorModels}
              required
            />
            <label className="form-control w-full">
              <span className="label-text text-slate-600 font-medium">RAM (GB)</span>
              <input
                type="number"
                min="1"
                value={form.ram}
                onChange={(e) => updateSpec("ram", e.target.value)}
                className="input input-bordered w-full mt-1"
              />
            </label>
            <SpecSelect
              label="Storage type"
              value={form.storageType}
              onChange={(v) => updateSpec("storageType", v)}
              options={specConfig.storageTypes}
            />
            <label className="form-control w-full">
              <span className="label-text text-slate-600 font-medium">Storage size (GB)</span>
              <input
                type="number"
                min="1"
                value={form.storageSize}
                onChange={(e) => updateSpec("storageSize", e.target.value)}
                className="input input-bordered w-full mt-1"
              />
            </label>
            <label className="form-control w-full">
              <span className="label-text text-slate-600 font-medium">Display size (inches)</span>
              <input
                type="number"
                min="1"
                step="0.1"
                value={form.displaySize}
                onChange={(e) => updateSpec("displaySize", e.target.value)}
                className="input input-bordered w-full mt-1"
              />
            </label>
            {isGaming && (
              <>
                <SpecSelect
                  label="GPU brand"
                  value={form.gpuBrand}
                  onChange={(v) => updateSpec("gpuBrand", v)}
                  options={GAMING_SPECS.gpuBrands}
                  required
                />
                <label className="form-control w-full">
                  <span className="label-text text-slate-600 font-medium">GPU model *</span>
                  <input
                    type="text"
                    placeholder="RTX 4050"
                    value={form.gpuModel}
                    onChange={(e) => updateSpec("gpuModel", e.target.value)}
                    className="input input-bordered w-full mt-1"
                    required
                  />
                </label>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
