import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { HiOutlineUserPlus } from "react-icons/hi2";
import { useCart } from "../src/context/CartContext";
import {
  API_USERS,
  GOOGLE_CLIENT_ID,
  formatAuthError,
  getGoogleAuthIssues,
  saveSessionAndRedirect,
} from "../src/lib/auth";

const API = API_USERS;

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { reloadCart } = useCart();

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    getGoogleAuthIssues().then((issues) => {
      if (issues.length > 0) setError(issues.join(" "));
    });
  }, []);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleRegister = async () => {
    setError("");
    if (!form.firstName || !form.lastName) {
      setError("Please enter your full name.");
      return;
    }
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await axios.post(import.meta.env.VITE_BACKEND_URL + "/api/users/", {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        password: form.password,
      });
      navigate("/login", {
        state: {
          message:
            "Account created! Please sign in. Your customer ID will be saved when you place your first order.",
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    if (!credentialResponse.credential) {
      setError("Google sign-in failed. Please try again.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/google`, {
        credential: credentialResponse.credential,
      });
      saveSessionAndRedirect({
        token: res.data.token,
        user: res.data.user,
        navigate,
        location,
        reloadCart,
      });
    } catch (err) {
      setError(formatAuthError(err, "Google sign-in failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  return (
    <div className="auth-shell">
      <div className="auth-card card-bg">
        <h1 className="section-title mb-1 text-center flex items-center justify-center gap-2">
          <HiOutlineUserPlus className="w-7 h-7 text-ocean" />
          Create account
        </h1>
        <p className="section-subtitle text-center mb-6">
          Join TechCart and start shopping. Customer ID is added at checkout.
        </p>

        {error && <div className="alert-modern-error mb-4">{error}</div>}

        {GOOGLE_CLIENT_ID && (
          <div className="mb-6 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google sign-in was cancelled or failed.")}
              theme="outline"
              size="large"
              text="signup_with"
              shape="rectangular"
              width="320"
            />
          </div>
        )}

        {GOOGLE_CLIENT_ID && (
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-sky/40" />
            <span className="text-xs text-base-content/40 uppercase tracking-wide">or</span>
            <div className="flex-1 h-px bg-sky/40" />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-base-content/70 mb-1.5">First name</label>
            <input
              type="text"
              placeholder="Jane"
              value={form.firstName}
              onChange={set("firstName")}
              onKeyDown={handleKeyDown}
              className="input-field"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-base-content/70 mb-1.5">Last name</label>
            <input
              type="text"
              placeholder="Doe"
              value={form.lastName}
              onChange={set("lastName")}
              onKeyDown={handleKeyDown}
              className="input-field"
            />
          </div>
        </div>

        <label className="block text-sm font-semibold text-base-content/70 mb-1.5">Email</label>
        <input
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set("email")}
          onKeyDown={handleKeyDown}
          className="input-field mb-4"
        />

        <label className="block text-sm font-semibold text-base-content/70 mb-1.5">Password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={set("password")}
          onKeyDown={handleKeyDown}
          className="input-field mb-4"
        />

        <label className="block text-sm font-semibold text-base-content/70 mb-1.5">Confirm password</label>
        <input
          type="password"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          onKeyDown={handleKeyDown}
          className="input-field mb-6"
        />

        <button onClick={handleRegister} disabled={loading} className="btn-brand w-full">
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p className="text-center text-sm text-base-content/55 mt-5">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-ocean cursor-pointer hover:underline font-semibold"
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}
