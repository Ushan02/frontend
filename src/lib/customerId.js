export const CUSTOMER_ID_HINT =
  "12 numbers only, or 11 numbers ending with V (e.g. 200205202165 or 12345678901V)";

const TWELVE_DIGITS_REGEX = /^\d{12}$/;
const ELEVEN_DIGITS_V_REGEX = /^\d{11}V$/;

export function normalizeCustomerId(value) {
  if (!value) return "";
  const trimmed = String(value).trim();
  if (/[vV]$/.test(trimmed)) {
    return `${trimmed.slice(0, -1)}V`;
  }
  return trimmed;
}

export function isValidCustomerId(value) {
  const normalized = normalizeCustomerId(value);
  if (!normalized) return false;
  if (TWELVE_DIGITS_REGEX.test(normalized)) return true;
  return ELEVEN_DIGITS_V_REGEX.test(normalized);
}

export function formatCustomerIdInput(value) {
  const raw = String(value).replace(/[^0-9vV]/g, "");
  if (/[vV]$/.test(raw)) {
    const digits = raw.slice(0, -1).replace(/\D/g, "").slice(0, 11);
    return `${digits}V`;
  }
  return raw.replace(/[^0-9]/g, "").slice(0, 12);
}
