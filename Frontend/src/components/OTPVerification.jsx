import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Mail, RefreshCw, CheckCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "../helper/axiosInstance";

const OTPVerification = ({ email, onVerified, onBack }) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    
    if (!/^\d+$/.test(pastedData)) {
      toast.error("Please paste only numbers");
      return;
    }

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length && i < 6; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus last filled input
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerify = async () => {
    const otpString = otp.join("");
    
    if (otpString.length !== 6) {
      toast.error("Please enter complete OTP");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post("/auth/verify-otp", {
        email,
        otp: otpString,
      });

      const data = response.data;

      if (data.success) {
        toast.success("Email verified successfully!");
        onVerified();
      } else {
        toast.error(data.message || "Invalid OTP");
        // Clear OTP on error
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);

    try {
      const response = await axiosInstance.post("/auth/resend-otp", {
        email
      });

      const data = response.data;

      if (data.success) {
        toast.success("New OTP sent to your email");
        setTimeLeft(600);
        setCanResend(false);
        setOtp(["", "", "", "", "", ""]);
        inputRefs.current[0]?.focus();
      } else {
        toast.error(data.message || "Failed to resend OTP");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="h-8 w-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          We've sent a 6-digit code to
        </p>
        <p className="font-semibold text-gray-800">{email}</p>
      </div>

      {/* OTP Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
          Enter Verification Code
        </label>
        <div className="flex justify-center gap-2 mb-4" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
              autoFocus={index === 0}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center">
          {timeLeft > 0 ? (
            <p className="text-sm text-gray-600">
              Time remaining: <span className="font-semibold text-blue-600">{formatTime(timeLeft)}</span>
            </p>
          ) : (
            <p className="text-sm text-red-600 font-semibold">OTP expired</p>
          )}
        </div>
      </div>

      {/* Verify Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleVerify}
        disabled={loading || otp.join("").length !== 6}
        className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Verifying...
          </>
        ) : (
          <>
            <CheckCircle className="h-5 w-5" />
            Verify Email
          </>
        )}
      </motion.button>

      {/* Resend OTP */}
      <div className="text-center">
        {canResend ? (
          <button
            onClick={handleResend}
            disabled={resendLoading}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 mx-auto"
          >
            <RefreshCw className={`h-4 w-4 ${resendLoading ? "animate-spin" : ""}`} />
            {resendLoading ? "Sending..." : "Resend OTP"}
          </button>
        ) : (
          <p className="text-sm text-gray-600">
            Didn't receive the code?{" "}
            <span className="text-gray-400">
              Wait {formatTime(timeLeft)} to resend
            </span>
          </p>
        )}
      </div>

      {/* Back Button */}
      <div className="text-center">
        <button
          onClick={onBack}
          className="text-sm font-semibold text-gray-600 hover:text-gray-800"
        >
          ← Back to Sign Up
        </button>
      </div>
    </motion.div>
  );
};

export default OTPVerification;
