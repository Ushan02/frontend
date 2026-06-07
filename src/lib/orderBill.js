import { getDefaultWarranty } from "./productCategories";
import { formatPrice } from "./formatPrice";
import { CONTACT_ADDRESS, CONTACT_EMAIL, CONTACT_PHONE } from "./contactInfo";

export function getLineWarranty(line) {
  const info = line.productinfo || {};
  if (info.warranty?.trim()) return info.warranty.trim();
  if (info.category) return getDefaultWarranty(info.category);
  const id = String(info.productId || "").toUpperCase();
  if (id.startsWith("LAP")) return getDefaultWarranty("laptop");
  if (id.startsWith("ACC")) return getDefaultWarranty("accessories");
  return "—";
}

export function billPaymentMethodLabel(method) {
  if (method === "split") return "Cash + Card";
  if (method === "card" || method === "stripe") return "Card";
  return "Cash";
}

export function billPaymentStatusLabel(status) {
  const labels = {
    paid: "Payment successful",
    partial_paid: "Partially paid",
    pending_cod: "Cash — pending",
    pending_pos: "Card — pending",
    awaiting_payment: "Awaiting payment",
    failed: "Payment failed",
    cancelled: "Cancelled",
  };
  return labels[status] || status;
}

export function formatBillDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const BILL_STORE = {
  name: "TechZone",
  email: CONTACT_EMAIL,
  phone: CONTACT_PHONE,
  address: CONTACT_ADDRESS,
};

export { formatPrice };
