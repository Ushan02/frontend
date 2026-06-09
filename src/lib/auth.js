export const SESSION_UPDATED_EVENT = "user-session-updated";

export function notifySessionUpdated() {
  window.dispatchEvent(new Event(SESSION_UPDATED_EVENT));
}

export function saveSession({ token, user }) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  notifySessionUpdated();
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  notifySessionUpdated();
}

export function saveSessionAndRedirect({ token, user, navigate, location, reloadCart }) {
  saveSession({ token, user });
  reloadCart();

  const redirectTo = location.state?.from;
  if (redirectTo) {
    navigate(redirectTo);
  } else if (user.role === "admin") {
    navigate("/admin");
  } else {
    navigate("/");
  }
}

export const GOOGLE_CLIENT_ID = (import.meta.env.VITE_GOOGLE_CLIENT_ID || "").trim();
export const API_USERS = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "") + "/api/users";

export function formatAuthError(err, fallback = "Something went wrong.") {
  if (!err?.response) {
    if (!import.meta.env.VITE_BACKEND_URL) {
      return "Backend URL not set. Add VITE_BACKEND_URL on Vercel and redeploy.";
    }
    return "Cannot reach server. Check that the backend is running on Render.";
  }
  const message = err.response?.data?.message;
  const detail = err.response?.data?.error;
  if (message && detail && !message.includes(detail)) {
    return `${message} (${detail})`;
  }
  return message || fallback;
}

export async function getGoogleAuthIssues() {
  const issues = [];
  if (!GOOGLE_CLIENT_ID) {
    issues.push("VITE_GOOGLE_CLIENT_ID is missing — set on Vercel and redeploy.");
  }
  if (!import.meta.env.VITE_BACKEND_URL) {
    issues.push("VITE_BACKEND_URL is missing — set on Vercel and redeploy.");
    return issues;
  }
  try {
    const res = await fetch(`${API_USERS}/auth-config`);
    if (!res.ok) throw new Error("config fetch failed");
    const data = await res.json();
    if (!data.googleConfigured) {
      issues.push("GOOGLE_CLIENT_ID is missing on Render — add it and redeploy backend.");
    } else if (GOOGLE_CLIENT_ID && data.googleClientId !== GOOGLE_CLIENT_ID) {
      issues.push("Google Client ID mismatch between Vercel (frontend) and Render (backend).");
    }
  } catch {
    issues.push("Could not verify backend Google login configuration.");
  }
  return issues;
}
