export const LAPTOP_WARRANTY = "1 Year";
export const ACCESSORY_WARRANTY = "6 months";

export function getDefaultWarranty(category) {
  return category === "laptop" ? LAPTOP_WARRANTY : ACCESSORY_WARRANTY;
}

export const PRODUCT_CATEGORIES = [
  { value: "laptop", label: "Laptops" },
  { value: "accessories", label: "Accessories" },
];

export const LAPTOP_SUB_CATEGORIES = [
  { value: "gaming", label: "Gaming" },
  { value: "business_and_student", label: "Business & Student" },
];

export const ACCESSORY_SUB_CATEGORIES = [
  { value: "memory", label: "Memory" },
  { value: "keyboard", label: "Keyboard" },
  { value: "mouse", label: "Mouse" },
  { value: "headset", label: "Headset" },
  { value: "cooling_pad", label: "Cooling Pad" },
  { value: "virusgard", label: "Virusgard" },
  { value: "mouse_pad", label: "Mouse Pad" },
  { value: "speakers", label: "Speakers" },
  { value: "cables", label: "Cables" },
  { value: "lightning", label: "Lightning" },
  { value: "charger", label: "Charger" },
  { value: "usb_flash_drive", label: "USB Flash Drive" },
  { value: "battery", label: "Battery" },
  { value: "hdd_enclosure", label: "HDD Enclosure" },
  { value: "laptop_bags", label: "Laptop Bags" },
];

export const SHOP_SECTIONS = [
  { key: "all", category: null, subCategory: null, label: "All Products" },
  { key: "gaming", category: "laptop", subCategory: "gaming", label: "Gaming Laptops" },
  {
    key: "business_and_student",
    category: "laptop",
    subCategory: "business_and_student",
    label: "Business & Student",
  },
  { key: "accessories", category: "accessories", subCategory: null, label: "Accessories" },
];

export function getCategoryLabel(category) {
  return PRODUCT_CATEGORIES.find((c) => c.value === category)?.label || category;
}

export function getSubCategoryLabel(subCategory) {
  return (
    LAPTOP_SUB_CATEGORIES.find((c) => c.value === subCategory)?.label ||
    ACCESSORY_SUB_CATEGORIES.find((c) => c.value === subCategory)?.label ||
    subCategory
  );
}

export const CORE_I_MODELS = ["Core i3", "Core i5", "Core i7", "Core i9"];

export const CORE_ULTRA_MODELS = [
  "Core Ultra 3",
  "Core Ultra 5",
  "Core Ultra 7",
  "Core Ultra 9",
];

export const RYZEN_MODELS = ["Ryzen 3", "Ryzen 5", "Ryzen 7", "Ryzen 9"];

export const ALL_PROCESSOR_MODELS = [
  ...CORE_I_MODELS,
  ...CORE_ULTRA_MODELS,
  ...RYZEN_MODELS,
];

export const GAMING_SPECS = {
  processorBrands: ["Intel", "AMD"],
  processorModels: ALL_PROCESSOR_MODELS,
  storageTypes: ["SSD", "HDD", "SSD+HDD"],
  gpuBrands: ["NVIDIA", "AMD"],
};

export const BUSINESS_SPECS = {
  processorBrands: ["Intel", "AMD", "Apple"],
  processorModels: ALL_PROCESSOR_MODELS,
  storageTypes: ["SSD", "HDD", "SSD+HDD"],
};
