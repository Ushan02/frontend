import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  HiOutlineArrowLeft,
  HiOutlineEnvelope,
  HiOutlineLockClosed,
  HiOutlineKey,
  HiOutlineShieldCheck,
} from "react-icons/hi2";

const API = import.meta.env.VITE_BACKEND_URL + "/api/users/forgot-password";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [message, setMessage] = useState("");
  const [devOtp, setDevOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (devOtp && step === 2) {
      setOtp(devOtp);
    }
  }, [devOtp, step]);

  const handleSendOtp = async () => {
    setError("");
    setMessage("");
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/send-otp`, { email: email.trim() });
      setMessage(res.data.message);
      setDevOtp(res.data.devOtp || "");
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setMessage("");
    if (!otp.trim()) {
      setError("Please enter the OTP from your email.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/verify-otp`, {
        email: email.trim(),
        otp: otp.trim(),
      });
      setResetToken(res.data.resetToken);
      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(
        msg === "Incorrect OTP. Please try again."
          ? "Incorrect OTP. If you clicked Send OTP again, use the latest code shown above."
          : msg || "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setMessage("");
    setOtp("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/send-otp`, { email: email.trim() });
      setMessage(res.data.message);
      setDevOtp(res.data.devOtp || "");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setError("");
    setMessage("");
    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/reset`, {
        resetToken,
        newPassword,
      });
      navigate("/login", { state: { message: res.data.message } });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-card card-bg">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm text-base-content/50 hover:text-ocean mb-4 font-medium"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <h1 className="section-title mb-1 text-center flex items-center justify-center gap-2">
          <HiOutlineKey className="w-7 h-7 text-ocean" />
          Forgot Password
        </h1>
        <p className="section-subtitle text-center mb-6">
          {step === 1 && "Enter your email to receive a one-time code."}
          {step === 2 && "Enter the OTP sent to your email."}
          {step === 3 && "Choose a new password."}
        </p>

        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= n
                  ? "bg-gradient-to-br from-ocean to-cyan text-white shadow-md"
                  : "bg-mist text-base-content/40"
              }`}
            >
              {n}
            </div>
          ))}
        </div>

        {message && <div className="alert-modern-success mb-4">{message}</div>}
        {error && <div className="alert-modern-error mb-4">{error}</div>}

        {step === 1 && (
          <>
            <label className="block text-sm font-semibold text-base-content/70 mb-1.5">Email</label>
            <div className="relative mb-6">
              <HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/35" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="input-field input-field-icon"
              />
            </div>
            <button onClick={handleSendOtp} disabled={loading} className="btn-brand w-full">
              {loading ? "Sending…" : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-xs text-base-content/50 mb-3 text-center">
              Code sent to <span className="font-semibold text-base-content/70">{email}</span>
            </p>
            {devOtp && (
              <div className="mb-4 px-4 py-2 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl text-sm text-center">
                Dev mode — email not delivered. OTP:{" "}
                <span className="font-mono font-bold tracking-widest">{devOtp}</span>
              </div>
            )}
            <label className="block text-sm font-semibold text-base-content/70 mb-1.5">OTP Code</label>
            <div className="relative mb-4">
              <HiOutlineShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/35" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                disabled={loading}
                className="input-field input-field-icon tracking-widest"
              />
            </div>
            <button onClick={handleVerifyOtp} disabled={loading} className="btn-brand w-full mb-3">
              {loading ? "Verifying…" : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="w-full text-sm text-ocean hover:underline mb-2 font-medium"
            >
              Resend code
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setOtp("");
                setDevOtp("");
                setError("");
                setMessage("");
              }}
              className="w-full text-sm text-base-content/50 hover:underline"
            >
              Use a different email
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <label className="block text-sm font-semibold text-base-content/70 mb-1.5">New Password</label>
            <div className="relative mb-4">
              <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/35" />
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                className="input-field input-field-icon"
              />
            </div>
            <label className="block text-sm font-semibold text-base-content/70 mb-1.5">Confirm Password</label>
            <div className="relative mb-6">
              <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/35" />
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="input-field input-field-icon"
              />
            </div>
            <button onClick={handleResetPassword} disabled={loading} className="btn-brand w-full">
              {loading ? "Updating…" : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
