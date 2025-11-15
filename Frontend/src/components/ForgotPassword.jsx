import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Clock, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "../helper/axiosInstance";
import OTPVerification from "./OTPVerification";

// Basic email format validation (no domain restriction for password reset)
const isValidEmailFormat = (email) => {
  const emailRegex = /^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/;
  return emailRegex.test(email.trim());
};

const ForgotPassword = ({ onBack, onResetComplete }) => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);

  // Step 1: Request Password Reset OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Basic email format validation only
      if (!email.trim()) {
        toast.error("Email is required");
        setEmailError("Email is required");
        setLoading(false);
        return;
      }

      if (!isValidEmailFormat(email)) {
        toast.error("Please enter a valid email address");
        setEmailError("Please enter a valid email address");
        setLoading(false);
        return;
      }

      const response = await axiosInstance.post("/auth/forgot-password", {
        email: email.trim()
      });

      if (response.data.success) {
        toast.success("OTP sent to your email!");
        setStep(2);
        setEmailError("");
      }
    } catch (error) {
      const message = error.response?.data?.message || "Failed to send OTP";
      toast.error(message);
      setEmailError(message);
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (enteredOtp) => {
    setLoading(true);
    setOtp(enteredOtp);

    try {
      const response = await axiosInstance.post("/auth/verify-reset-otp", {
        email: email.trim(),
        otp: enteredOtp
      });

      if (response.data.success) {
        toast.success("OTP verified! Set your new password.");
        setOtpVerified(true);
        setStep(3);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
      throw error; // Re-throw to let OTPVerification handle it
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match!");
        setLoading(false);
        return;
      }

      if (newPassword.length < 6) {
        toast.error("Password must be at least 6 characters long");
        setLoading(false);
        return;
      }

      const response = await axiosInstance.post("/auth/reset-password", {
        email: email.trim(),
        otp: otp,
        newPassword: newPassword
      });

      if (response.data.success) {
        toast.success("Password reset successful! Please login.");
        onResetComplete();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOTP = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.post("/auth/resend-reset-otp", {
        email: email.trim()
      });

      if (response.data.success) {
        toast.success("New OTP sent to your email!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (value.trim() === "") {
      setEmailError("");
    } else if (!isValidEmailFormat(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  return (
    <div className="w-full">
      {/* Step 1: Email Input */}
      {step === 1 && (
        <motion.form
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onSubmit={handleRequestOTP}
          className="space-y-6"
        >
          <div className="mb-6">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </button>
          </div>

          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Forgot Password?
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Enter your registered email address and we'll send you an OTP to reset your password.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={handleEmailChange}
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  emailError ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter your registered email"
              />
            </div>
            {emailError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 flex items-start gap-2 text-red-600 text-sm"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>{emailError}</span>
              </motion.div>
            )}
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || emailError}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Sending OTP...
              </span>
            ) : (
              "Send OTP"
            )}
          </motion.button>
        </motion.form>
      )}

      {/* Step 2: OTP Verification */}
      {step === 2 && !otpVerified && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <div className="mb-6">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Change Email
            </button>
          </div>

          <OTPVerification
            email={email}
            onVerified={handleVerifyOTP}
            onBack={() => setStep(1)}
            onResend={handleResendOTP}
            title="Verify OTP"
            description={`We've sent a 6-digit OTP to ${email}. Please enter it below to reset your password.`}
          />
        </motion.div>
      )}

      {/* Step 3: New Password */}
      {step === 3 && otpVerified && (
        <motion.form
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          onSubmit={handleResetPassword}
          className="space-y-6"
        >
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Create New Password
            </h3>
            <p className="text-gray-600 text-sm mb-6">
              Choose a strong password for your account.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter new password"
            />
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 6 characters long
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Confirm new password"
            />
          </div>

          {newPassword && confirmPassword && newPassword !== confirmPassword && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-red-600 text-sm"
            >
              <AlertCircle className="h-4 w-4" />
              <span>Passwords do not match</span>
            </motion.div>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading || newPassword !== confirmPassword}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold shadow-md hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Resetting Password...
              </span>
            ) : (
              "Reset Password"
            )}
          </motion.button>
        </motion.form>
      )}
    </div>
  );
};

export default ForgotPassword;
