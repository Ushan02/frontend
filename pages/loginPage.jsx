import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import { useCart } from "../src/context/CartContext";
import { GOOGLE_CLIENT_ID, saveSessionAndRedirect } from "../src/lib/auth";

const API = import.meta.env.VITE_BACKEND_URL + "/api/users";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { reloadCart } = useCart();

  const successMsg = location.state?.message;

  const finishAuth = (token, user) => {
    saveSessionAndRedirect({ token, user, navigate, location, reloadCart });
  };

  const handleLogin = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/login`, { email, password });
      finishAuth(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
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
      finishAuth(res.data.token, res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Google sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="flex flex-1 flex-col justify-center items-center bg-base-200 px-4 py-8 sm:py-12 min-w-0">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center text-gray-800 flex items-center justify-center gap-2">
          <HiOutlineArrowRightOnRectangle className="w-7 h-7 text-blue-500" />
          Sign In
        </h1>

        {successMsg && (
          <div className="mb-4 px-4 py-2 bg-green-100 border border-green-300 text-green-700 rounded text-sm">
            {successMsg}
          </div>
        )}

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
              text="continue_with"
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

        <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
        <div className="relative mb-4">
          <HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="w-full border border-gray-300 rounded pl-10 pr-3 py-2.5 min-h-11 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div className="flex items-center justify-between mb-1">
          <label className="block text-sm font-medium text-gray-600">Password</label>
          <Link to="/forgot-password" className="text-xs text-blue-500 hover:underline">
            Forgot password?
          </Link>
        </div>
        <div className="relative mb-6">
          <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="w-full border border-gray-300 rounded pl-10 pr-3 py-2.5 min-h-11 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2.5 min-h-11 rounded-lg transition flex items-center justify-center gap-2"
        >
          <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
          {loading ? "Signing in…" : "Login"}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Don&apos;t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-blue-500 cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
