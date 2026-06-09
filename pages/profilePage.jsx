import { useEffect, useState } from "react";
import axios from "axios";
import {
  HiOutlineUser,
  HiOutlineEnvelope,
  HiOutlineIdentification,
} from "react-icons/hi2";
import { API_USERS, saveSession } from "../src/lib/auth";
import { getAuthHeaders } from "../src/lib/adminApi";

export default function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadProfile() {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get(`${API_USERS}/me`, { headers: getAuthHeaders() });
        if (cancelled) return;
        setProfile(res.data);
        setForm({
          firstName: res.data.firstName || "",
          lastName: res.data.lastName || "",
          email: res.data.email || "",
        });
      } catch (err) {
        if (!cancelled) {
          setError(err.response?.data?.message || "Failed to load your profile.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.firstName.trim() || !form.lastName.trim() || !form.email.trim()) {
      setError("First name, last name, and email are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
      };

      const res = await axios.patch(`${API_USERS}/me`, payload, { headers: getAuthHeaders() });
      setProfile(res.data.user);
      saveSession({ token: res.data.token, user: res.data.user });
      setSuccess(res.data.message || "Profile updated.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell flex-1 min-w-0">
        <div className="page-container max-w-xl py-6 sm:py-10 w-full">
          <p className="text-base-content/60">Loading your profile…</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="page-shell flex-1 min-w-0">
        <div className="page-container max-w-xl py-6 sm:py-10 w-full">
          <div className="alert-modern-error">{error || "Could not load profile."}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell flex-1 min-w-0">
      <div className="page-container max-w-xl py-6 sm:py-10 w-full">
        <div className="mb-6 sm:mb-8">
          <span className="section-eyebrow mb-3">
            <HiOutlineUser className="w-3.5 h-3.5" />
            Your account
          </span>
          <h1 className="section-title flex items-center gap-2">
            <HiOutlineUser className="w-7 h-7 text-ocean shrink-0" />
            My Profile
          </h1>
          <p className="text-base-content/60 mt-2 text-sm sm:text-base">
            Update your name and email. Customer ID is read-only.
          </p>
        </div>

        {error && <div className="alert-modern-error mb-4">{error}</div>}
        {success && <div className="alert-modern-success mb-4">{success}</div>}

        <form onSubmit={handleSave} className="card-modern p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-base-content/70 mb-1.5">
                First name
              </label>
              <input
                type="text"
                value={form.firstName}
                onChange={set("firstName")}
                className="input-field"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-base-content/70 mb-1.5">
                Last name
              </label>
              <input
                type="text"
                value={form.lastName}
                onChange={set("lastName")}
                className="input-field"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-base-content/70 mb-1.5">Email</label>
            <div className="relative">
              <HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40 pointer-events-none" />
              <input
                type="email"
                value={form.email}
                onChange={set("email")}
                className="input-field input-field-icon"
                required
              />
            </div>
          </div>

          {profile.role === "customer" && (
            <div>
              <label className="block text-sm font-semibold text-base-content/70 mb-1.5">
                Customer ID
              </label>
              <div className="relative">
                <HiOutlineIdentification className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40 pointer-events-none" />
                <input
                  type="text"
                  value={profile.customerId || "Not set yet"}
                  readOnly
                  disabled
                  className="input-field input-field-icon bg-slate-50 text-base-content/60 cursor-not-allowed"
                />
              </div>
              <p className="text-xs text-base-content/50 mt-1.5">
                Customer ID cannot be changed here. Contact support if you need it updated.
              </p>
            </div>
          )}

          <button type="submit" disabled={saving} className="btn-brand w-full sm:w-auto">
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
