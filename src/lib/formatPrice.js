export function formatPrice(amount) {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "RS 0.00";

  const formatted = value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `RS ${formatted}`;
}
