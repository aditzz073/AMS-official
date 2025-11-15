import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, AtSign, Key, AlertCircle } from "lucide-react";
import { toast } from "react-hot-toast";
import axiosInstance from "../helper/axiosInstance";
import { useDispatch } from "react-redux";
import { logout, setEmpCode, setToken } from "../redux/authSlice";
import logo from "../dscelogo.png";
import OTPVerification from "../components/OTPVerification";
import ForgotPassword from "../components/ForgotPassword";
import { validateEmail, getDomainExample } from "../utils/emailValidator";

const Auth = () => {
  const navigate = useNavigate();
  const dispatch=useDispatch()
  const [isSignUp, setIsSignUp] = useState(false);
  const [showOTP, setShowOTP] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "faculty"
  });

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // Try to restore full auth state
      try {
        const authStateString = localStorage.getItem("authState");
        if (authStateString) {
          const authState = JSON.parse(authStateString);
          if (authState.token === token) {
            dispatch(setToken({ token: authState.token, user: { email: authState.email } }))
          }
        } else {
          // Fallback to just setting token
          dispatch(setToken({ token, user: {} }))
        }
      } catch (error) {
        console.error("Error restoring auth state:", error);
        dispatch(setToken({ token, user: {} }))
      }

      navigate("/page");
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Real-time email validation for signup
    if (name === "email" && isSignUp) {
      if (value.trim() === "") {
        setEmailError("");
      } else {
        const validation = validateEmail(value);
        setEmailError(validation.isValid ? "" : validation.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        // Validate email domain before proceeding
        const emailValidation = validateEmail(formData.email);
        if (!emailValidation.isValid) {
          toast.error(emailValidation.message);
          setEmailError(emailValidation.message);
          setLoading(false);
          return;
        }

        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match!");
          setLoading(false);
          return;
        }

        // Request OTP for email verification
        const otpResponse = await axiosInstance.post("/auth/request-otp", {
          email: formData.email
        });

        if (otpResponse.data.success) {
          toast.success("OTP sent to your email!");
          setShowOTP(true);
        }
      } else {
        const response = await axiosInstance.post("/login", {
          email: formData.email,
          password: formData.password
        });
        console.log(response);
        
        handleAuthSuccess(response.data);
        toast.success("Welcome back!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerified = async () => {
    setLoading(true);
    
    try {
      // Now create the account after OTP verification
      const { confirmPassword, ...signupData } = formData;
      const response = await axiosInstance.post("/signup", signupData);
      
      handleAuthSuccess(response.data);
      toast.success("Account created successfully!");
      setShowOTP(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Registration failed");
      setShowOTP(false);
    } finally {
      setLoading(false);
    }
  };

  const handleBackFromOTP = () => {
    setShowOTP(false);
    setEmailError("");
    setFormData({
      email: "",
      password: "",
      confirmPassword: "",
      role: "faculty"
    });
  };

  const handleShowForgotPassword = () => {
    setShowForgotPassword(true);
    setIsSignUp(false);
    setShowOTP(false);
  };

  const handleBackFromForgotPassword = () => {
    setShowForgotPassword(false);
  };

  const handleResetComplete = () => {
    setShowForgotPassword(false);
    toast.success("You can now login with your new password");
  };

  const handleAuthSuccess = (data) => {
    localStorage.setItem("token", data.token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
    
    dispatch(setToken({ token: data.token, user: data.user }))
    // dispatch(setEmpCode(data.employeeCodes))
    // Set auto logout after token expires
    setTimeout(() => {
      handleLogout();
    }, data.expiresIn);

    navigate("/page");
  };

  const handleLogout = async () => {
      try {
        const response=await axiosInstance.post("/logout");
        console.log(response);
        
        localStorage.removeItem("token");
        localStorage.clear();
        dispatch(logout())
        delete axiosInstance.defaults.headers.common["Authorization"];
        navigate("/");
        toast.success("Logged out successfully");
      } catch (error) {
        console.error("Logout error:", error);
      }
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-8 py-6 bg-gradient-to-r from-blue-500 to-indigo-600">
            <div className="text-center">
            {/* <Lock className="h-12 w-12 text-white mx-auto mb-4" /> */}
            <img src={logo} className="h-22 w-full text-white mx-auto mb-4" alt="dsce" />
                          <h1 className="text-3xl font-bold text-white">
                {showOTP 
                  ? "Verify Email" 
                  : showForgotPassword 
                    ? "Reset Password"
                    : isSignUp 
                      ? "Create Account" 
                      : "Appraisal Management System"}
              </h1>
              <p className="text-blue-100 mt-2">
                {showOTP 
                  ? "Enter the OTP sent to your email"
                  : showForgotPassword
                    ? "Recover your account"
                    : isSignUp 
                      ? "Sign up to get started with your account" 
                      : "Sign in to continue to your account"}
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {showForgotPassword ? (
                <ForgotPassword
                  key="forgot-password"
                  onBack={handleBackFromForgotPassword}
                  onResetComplete={handleResetComplete}
                />
              ) : showOTP ? (
                <OTPVerification
                  key="otp"
                  email={formData.email}
                  onVerified={handleOTPVerified}
                  onBack={handleBackFromOTP}
                />
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                  {isSignUp && (
                    <span className="text-xs text-gray-500 ml-2">
                      (Use {getDomainExample()})
                    </span>
                  )}
                </label>
                <div className="relative">
                <AtSign className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      emailError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your email"
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                <Key className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                    type="password"
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {isSignUp && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                    <Key className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                        type="password"
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Confirm your password"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="faculty">Faculty</option>
                      <option value="principal">Principal</option>
                      <option value="hod">HOD</option>
                      <option value="external">External evaluator</option>
                      <option value="admin">Admin</option>

                    </select>
                  </div>
                </>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading || (isSignUp && emailError)}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg font-semibold shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : isSignUp ? "Create Account" : "Sign In"
                }
              </motion.button>

              {/* Forgot Password Link */}
              {!isSignUp && (
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleShowForgotPassword}
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <div className="text-center text-sm text-gray-600">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setEmailError("");
                  }}
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  {isSignUp ? "Sign In" : "Create Account"}
                </button>
              </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;