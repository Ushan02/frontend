import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import GoogleSignInButton from "../components/GoogleSignInButton";
import {
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineArrowRightOnRectangle,
} from "react-icons/hi2";
import { useCart } from "../src/context/CartContext";
import {
  API_USERS,
  GOOGLE_CLIENT_ID,
  formatAuthError,
  getGoogleAuthIssues,
  saveSessionAndRedirect,
} from "../src/lib/auth";

const API = API_USERS;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { reloadCart } = useCart();

  const successMsg = location.state?.message;

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;
    getGoogleAuthIssues().then((issues) => {
      if (issues.length > 0) setError(issues.join(" "));
    });
  }, []);

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
      setError(formatAuthError(err, "Google sign-in failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="auth-shell">
      <div className="auth-card card-bg">
        <h1 className="section-title mb-1 text-center flex items-center justify-center gap-2">
          <HiOutlineArrowRightOnRectangle className="w-7 h-7 text-ocean" />
          Sign In
        </h1>
        <p className="section-subtitle text-center mb-6">
          Welcome back — sign in to continue.
        </p>

        {successMsg && <div className="alert-modern-success mb-4">{successMsg}</div>}
        {error && <div className="alert-modern-error mb-4">{error}</div>}

        {GOOGLE_CLIENT_ID && (
          <div className="mb-6">
            <GoogleSignInButton
              onSuccess={handleGoogleSuccess}
              onError={() => setError("Google sign-in was cancelled or failed.")}
              text="continue_with"
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

        <label className="block text-sm font-semibold text-base-content/70 mb-1.5">Email</label>
        <div className="relative mb-4">
          <HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/35" />
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="input-field input-field-icon"
          />
        </div>

        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-semibold text-base-content/70">Password</label>
          <Link to="/forgot-password" className="text-xs text-ocean hover:underline font-medium">
            Forgot password?
          </Link>
        </div>
        <div className="relative mb-6">
          <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/35" />
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="input-field input-field-icon"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="btn-brand w-full"
        >
          <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
          {loading ? "Signing in…" : "Login"}
        </button>

        <p className="text-center text-sm text-base-content/55 mt-5">
          Don&apos;t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-ocean cursor-pointer hover:underline font-semibold"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
