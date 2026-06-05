export const PRODUCT_CATEGORIES = [
  { value: "laptop", label: "Laptops" },
  { value: "accessories", label: "Accessories" },
];

export function getCategoryLabel(category) {
  return PRODUCT_CATEGORIES.find((c) => c.value === category)?.label || "Accessories";
}
