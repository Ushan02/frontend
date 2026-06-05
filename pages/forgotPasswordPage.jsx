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
    <div className="flex flex-1 flex-col justify-center items-center bg-base-200 px-4 py-8 sm:py-12 min-w-0">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-md w-full max-w-sm">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-4"
        >
          <HiOutlineArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        <h1 className="text-xl sm:text-2xl font-bold mb-2 text-center text-gray-800 flex items-center justify-center gap-2">
          <HiOutlineKey className="w-7 h-7 text-blue-500" />
          Forgot Password
        </h1>
        <p className="text-sm text-gray-500 text-center mb-6">
          {step === 1 && "Enter your email to receive a one-time code."}
          {step === 2 && "Enter the OTP sent to your email."}
          {step === 3 && "Choose a new password."}
        </p>

        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step >= n ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-500"
              }`}
            >
              {n}
            </div>
          ))}
        </div>

        {message && (
          <div className="mb-4 px-4 py-2 bg-green-100 border border-green-300 text-green-700 rounded text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 px-4 py-2 bg-red-100 border border-red-300 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {step === 1 && (
          <>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
            <div className="relative mb-6">
              <HiOutlineEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full border border-gray-300 rounded pl-10 pr-3 py-2.5 min-h-11 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              onClick={handleSendOtp}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2.5 min-h-11 rounded-lg transition"
            >
              {loading ? "Sending…" : "Send OTP"}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <p className="text-xs text-gray-500 mb-3 text-center">
              Code sent to <span className="font-medium">{email}</span>
            </p>
            {devOtp && (
              <div className="mb-4 px-4 py-2 bg-amber-50 border border-amber-300 text-amber-800 rounded text-sm text-center">
                Dev mode — email not delivered. OTP:{" "}
                <span className="font-mono font-bold tracking-widest">{devOtp}</span>
              </div>
            )}
            <label className="block text-sm font-medium text-gray-600 mb-1">OTP Code</label>
            <div className="relative mb-4">
              <HiOutlineShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                disabled={loading}
                className="w-full border border-gray-300 rounded pl-10 pr-3 py-2.5 min-h-11 text-base tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2.5 min-h-11 rounded-lg transition mb-3"
            >
              {loading ? "Verifying…" : "Verify OTP"}
            </button>
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={loading}
              className="w-full text-sm text-blue-500 hover:underline mb-2"
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
              className="w-full text-sm text-gray-500 hover:underline"
            >
              Use a different email
            </button>
          </>
        )}

        {step === 3 && (
          <>
            <label className="block text-sm font-medium text-gray-600 mb-1">New Password</label>
            <div className="relative mb-4">
              <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                className="w-full border border-gray-300 rounded pl-10 pr-3 py-2.5 min-h-11 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Confirm Password</label>
            <div className="relative mb-6">
              <HiOutlineLockClosed className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full border border-gray-300 rounded pl-10 pr-3 py-2.5 min-h-11 text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              onClick={handleResetPassword}
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold py-2.5 min-h-11 rounded-lg transition"
            >
              {loading ? "Updating…" : "Reset Password"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
