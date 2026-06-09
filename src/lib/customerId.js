export const CUSTOMER_ID_REGEX = /^\d{10,11}V$/;

export const CUSTOMER_ID_HINT = "10 or 11 numbers ending with V (e.g. 1999236512V or 20020520216V)";

export function normalizeCustomerId(value) {
  if (!value) return "";
  let trimmed = String(value).trim();
  if (/[vV]$/.test(trimmed)) {
    trimmed = trimmed.slice(0, -1);
  }
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  return `${digits}V`;
}

export function isValidCustomerId(value) {
  const normalized = normalizeCustomerId(value);
  if (!CUSTOMER_ID_REGEX.test(normalized)) return false;
  const digits = normalized.slice(0, -1);
  return digits.length === 10 || digits.length === 11;
}

export function formatCustomerIdInput(value) {
  let raw = String(value).trim();
  if (/[vV]$/.test(raw)) {
    raw = raw.slice(0, -1);
  }
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (!digits) return "";
  return `${digits}V`;
}
