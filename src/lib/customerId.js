export const CUSTOMER_ID_REGEX = /^\d{10,11}V$/;

export const CUSTOMER_ID_HINT =
  "Type 10 or 11 numbers then V at the end (e.g. 1999236512V)";

export function normalizeCustomerId(value) {
  if (!value) return "";
  return String(value).trim().toUpperCase();
}

export function isValidCustomerId(value) {
  const normalized = normalizeCustomerId(value);
  if (!CUSTOMER_ID_REGEX.test(normalized)) return false;
  const digits = normalized.slice(0, -1);
  return digits.length === 10 || digits.length === 11;
}

export function formatCustomerIdInput(value) {
  return String(value)
    .toUpperCase()
    .replace(/[^0-9V]/g, "")
    .slice(0, 12);
}
