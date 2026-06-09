import { useEffect, useState } from "react";
import axios from "axios";
import {
  HiOutlineXMark,
  HiOutlineUser,
  HiOutlineShieldCheck,
  HiOutlineNoSymbol,
  HiOutlineCheck,
  HiOutlineTrash,
} from "react-icons/hi2";
import { API_BASE, getAuthHeaders } from "../src/lib/adminApi";
import {
  CUSTOMER_ID_HINT,
  formatCustomerIdInput,
  isValidCustomerId,
} from "../src/lib/customerId";

const API = API_BASE + "/api/users";

function RoleBadge({ role }) {
  return (
    <span
      className={`px-2.5 py-1 rounded-full text-xs font-medium ${
        role === "admin" ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-700"
      }`}
    >
      {role}
    </span>
  );
}

export default function UserDetailModal({
  user,
  currentUserId,
  onClose,
  onUserUpdated,
  onUserDeleted,
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    customerId: "",
    password: "",
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      customerId: user.customerId || "",
      password: "",
    });
    setError("");
    setSuccess("");
  }, [user]);

  if (!user) return null;

  const isSelf = user._id === currentUserId;
  const isCustomer = user.role === "customer";

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError("First name, last name, and email are required.");
      return;
    }

    if (isCustomer && form.customerId && !isValidCustomerId(form.customerId)) {
      setError(CUSTOMER_ID_HINT);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
      };
      if (isCustomer) {
        payload.customerId = form.customerId;
      }
      if (form.password.trim()) {
        payload.password = form.password;
      }

      const res = await axios.patch(`${API}/${user._id}`, payload, {
        headers: getAuthHeaders(),
      });
      onUserUpdated?.(res.data.user);
      setSuccess(res.data.message);
      setForm((prev) => ({ ...prev, password: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  const promoteToAdmin = () => {
    if (!window.confirm("Promote this user to admin? They will have full admin access.")) return;
    setError("");
    setSuccess("");
    axios
      .patch(`${API}/${user._id}/role`, { role: "admin" }, { headers: getAuthHeaders() })
      .then((res) => {
        onUserUpdated?.(res.data.user);
        setSuccess(res.data.message);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to promote user."));
  };

  const demoteToCustomer = () => {
    if (!window.confirm("Remove admin access from this user?")) return;
    setError("");
    setSuccess("");
    axios
      .patch(`${API}/${user._id}/role`, { role: "customer" }, { headers: getAuthHeaders() })
      .then((res) => {
        onUserUpdated?.(res.data.user);
        setSuccess(res.data.message);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to update role."));
  };

  const toggleBlock = () => {
    setError("");
    setSuccess("");
    axios
      .patch(`${API}/${user._id}/block`, {}, { headers: getAuthHeaders() })
      .then((res) => {
        onUserUpdated?.(res.data.user);
        setSuccess(res.data.message);
      })
      .catch((err) => setError(err.response?.data?.message || "Failed to update block status."));
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Delete ${user.firstName} ${user.lastName}? This cannot be undone.`
      )
    ) {
      return;
    }

    setDeleting(true);
    setError("");
    try {
      const res = await axios.delete(`${API}/${user._id}`, {
        headers: getAuthHeaders(),
      });
      onUserDeleted?.(user._id);
      onClose();
      alert(res.data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        aria-label="Close user details"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-4 px-6 py-4 border-b border-slate-200 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <HiOutlineUser className="w-6 h-6 text-[#0077b6]" />
              User Details
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {user.firstName} {user.lastName}
              {isSelf && <span className="ml-2 text-slate-400">(you)</span>}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 shrink-0"
            aria-label="Close"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex flex-wrap items-center gap-2">
            <RoleBadge role={user.role} />
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                user.isBlock ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
              }`}
            >
              {user.isBlock ? "Blocked" : "Active"}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 capitalize">
              {user.authProvider || "local"} sign-in
            </span>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="px-4 py-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-xs font-semibold uppercase text-slate-500">First name *</span>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase text-slate-500">Last name *</span>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase text-slate-500">Email *</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
                />
              </label>
              {isCustomer && (
                <label className="block sm:col-span-2">
                  <span className="text-xs font-semibold uppercase text-slate-500">Customer ID</span>
                  <input
                    type="text"
                    value={form.customerId}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, customerId: formatCustomerIdInput(e.target.value) }))
                    }
                    className="mt-1 w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="1999236512V"
                  />
                  <p className="text-xs text-slate-400 mt-1">{CUSTOMER_ID_HINT}</p>
                </label>
              )}
              <label className="block sm:col-span-2">
                <span className="text-xs font-semibold uppercase text-slate-500">New password</span>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Leave blank to keep current password"
                  minLength={6}
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-[#0077b6] hover:bg-[#03045e] disabled:opacity-60 text-white text-sm font-semibold"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-slate-800">Account actions</p>
            <div className="flex flex-wrap gap-2">
              {user.role !== "admin" && (
                <button
                  type="button"
                  onClick={promoteToAdmin}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200"
                >
                  <HiOutlineShieldCheck className="w-4 h-4" />
                  Make admin
                </button>
              )}
              {user.role === "admin" && !isSelf && (
                <button
                  type="button"
                  onClick={demoteToCustomer}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-slate-200 text-slate-700 hover:bg-slate-300"
                >
                  Remove admin
                </button>
              )}
              {user.role !== "admin" && (
                <button
                  type="button"
                  onClick={toggleBlock}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium ${
                    user.isBlock
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-red-100 text-red-700 hover:bg-red-200"
                  }`}
                >
                  {user.isBlock ? (
                    <>
                      <HiOutlineCheck className="w-4 h-4" />
                      Unblock
                    </>
                  ) : (
                    <>
                      <HiOutlineNoSymbol className="w-4 h-4" />
                      Block
                    </>
                  )}
                </button>
              )}
              {!isSelf && user.role !== "admin" && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
                >
                  <HiOutlineTrash className="w-4 h-4" />
                  {deleting ? "Deleting…" : "Delete user"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
