import axios from "axios";
import { API_BASE, getAuthHeaders } from "./adminApi";

export const ADMIN_NOTIFICATIONS_EVENT = "admin-notifications-updated";

export function notifyAdminNotificationsUpdated() {
  window.dispatchEvent(new Event(ADMIN_NOTIFICATIONS_EVENT));
}

export async function fetchAdminUnreadCounts() {
  const headers = getAuthHeaders();
  try {
    const [messagesRes, reviewsRes] = await Promise.all([
      axios.get(`${API_BASE}/api/contact/unread-count`, { headers }),
      axios.get(`${API_BASE}/api/review/unread-count`, { headers }),
    ]);
    return {
      unreadMessages: messagesRes.data?.count ?? 0,
      unreadReviews: reviewsRes.data?.count ?? 0,
    };
  } catch {
    return { unreadMessages: 0, unreadReviews: 0 };
  }
}

export async function markAllMessagesRead() {
  await axios.patch(`${API_BASE}/api/contact/mark-all-read`, {}, { headers: getAuthHeaders() });
  notifyAdminNotificationsUpdated();
}

export async function markAllReviewsRead() {
  await axios.patch(`${API_BASE}/api/review/mark-all-read`, {}, { headers: getAuthHeaders() });
  notifyAdminNotificationsUpdated();
}
