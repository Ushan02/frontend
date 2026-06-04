export const API_BASE = import.meta.env.VITE_BACKEND_URL;

export function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
