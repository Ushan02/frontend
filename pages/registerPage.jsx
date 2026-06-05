import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { useCart } from "../src/context/CartContext";
import { GOOGLE_CLIENT_ID, saveSessionAndRedirect } from "../src/lib/auth";

const API = import.meta.env.VITE_BACKEND_URL + "/api/users";

export default function RegisterPage() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { reloadCart } = useCart();

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
      await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/users/",
        {
          firstName: form.firstName,
          lastName:  form.lastName,
          email:     form.email,
          password:  form.password,
          // role defaults to "customer", isBlock defaults to false in model
        }
      );
      // Redirect to login with success message — no auto-login
      navigate("/login", { state: { message: "Account created! Please sign in." } });
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
      setError(err.response?.data?.message || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleRegister();
  };

  return (
    <div className="flex flex-1 flex-col justify-center items-center bg-base-200 px-4 py-8 sm:py-12 min-w-0">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center text-gray-800">
          Create account
        </h1>

        {error && (
          <div className="mb-4 px-4 py-2 bg-red-100 border border-red-300 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

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
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-400 uppercase tracking-wide">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              First name
            </label>
            <input
              type="text"
              placeholder="Jane"
              value={form.firstName}
              onChange={set("firstName")}
              onKeyDown={handleKeyDown}
              className="w-full border border-gray-300 rounded px-3 py-2.5 min-h-11 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Last name
            </label>
            <input
              type="text"
              placeholder="Doe"
              value={form.lastName}
              onChange={set("lastName")}
              onKeyDown={handleKeyDown}
              className="w-full border border-gray-300 rounded px-3 py-2.5 min-h-11 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <label className="block text-sm font-medium text-gray-600 mb-1">
          Email
        </label>
        <input
          type="email"
          placeholder="you@example.com"
          value={form.email}
          onChange={set("email")}
          onKeyDown={handleKeyDown}
          className="w-full border border-gray-300 rounded px-3 py-2.5 min-h-11 text-base mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block text-sm font-medium text-gray-600 mb-1">
          Password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          value={form.password}
          onChange={set("password")}
          onKeyDown={handleKeyDown}
          className="w-full border border-gray-300 rounded px-3 py-2.5 min-h-11 text-base mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <label className="block text-sm font-medium text-gray-600 mb-1">
          Confirm password
        </label>
        <input
          type="password"
          placeholder="••••••••"
          value={form.confirmPassword}
          onChange={set("confirmPassword")}
          onKeyDown={handleKeyDown}
          className="w-full border border-gray-300 rounded px-3 py-2.5 min-h-11 text-base mb-6 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <button
          onClick={handleRegister}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2.5 min-h-11 rounded-lg transition"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}
