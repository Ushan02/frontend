export const CUSTOMER_ID_REGEX = /^\d{10,11}V$/;

export function normalizeCustomerId(value) {
  if (!value) return "";
  const trimmed = String(value).trim().toUpperCase();
  if (!trimmed) return "";
  return trimmed.endsWith("V") ? trimmed : `${trimmed}V`;
}

export function isValidCustomerId(value) {
  return CUSTOMER_ID_REGEX.test(normalizeCustomerId(value));
}

export function formatCustomerIdInput(value) {
  const digits = String(value).replace(/\D/g, "").slice(0, 11);
  return digits ? `${digits}V` : "";
}
