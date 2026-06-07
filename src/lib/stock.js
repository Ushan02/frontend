export function sanitizeStockInput(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function parseStock(value) {
  const sanitized = sanitizeStockInput(value);
  if (sanitized === "") return null;
  return Number(sanitized);
}

export function parsePositiveQuantity(value) {
  const stock = parseStock(value);
  if (stock === null || stock < 1) return null;
  return stock;
}
