import express from "express"
import evaluateScores from "../controller/calculate.js"
import { createOrUpdateEmployee, getAllEmployeeCodes, getEmployeeById } from "../controller/handelData.js"
import { getOrCreateBasicInfo, updateBasicInfo, getBasicInfoByIdentifier } from "../controller/basicEmployeeInfoController.js"
import { login, logout, signup } from "../controller/authController.js"
import { requestOTP, verifyOTP, resendOTP } from "../controller/otpController.js"
import { requestPasswordReset, verifyResetOTP, resetPassword, resendResetOTP } from "../controller/passwordResetController.js"
import { getRemarks, updateRemarks, bulkUpdateRemarks } from "../controller/remarksController.js"
import { getLoginLogs, getLoginStats, closeStaleSession } from "../controller/loginLogController.js"
import uploadFields from "../middleware/multerMiddleware.js"
import { protect, adminOnly } from "../middleware/auth.js"
import { loginLimiter, apiLimiter, otpLimiter, passwordResetLimiter, adminLimiter } from "../middleware/rateLimiter.js"

const router=express.Router()

router.post("/total",evaluateScores)
router.post("/addData", protect, uploadFields, createOrUpdateEmployee) // Protected route
router.get("/getData/:id", protect, getEmployeeById) // Protected route - id can be email or employeeCode
router.get("/getEmpCode", protect, getAllEmployeeCodes) // Protected route

// Basic Employee Info routes
router.get("/basicInfo", protect, getOrCreateBasicInfo) // Get current user's basic info
router.put("/basicInfo", protect, updateBasicInfo) // Update current user's basic info
router.get("/basicInfo/:identifier", protect, getBasicInfoByIdentifier) // Get basic info by email or employeeCode (HOD/External/Admin)

// Remarks routes
router.get("/remarks/:employeeCode", protect, getRemarks) // Get remarks
router.put("/remarks/:employeeCode", protect, updateRemarks) // Update single remark
router.put("/remarks/:employeeCode/bulk", protect, bulkUpdateRemarks) // Bulk update remarks

// Auth routes - OTP verification (with rate limiting)
router.post('/auth/request-otp', otpLimiter, requestOTP); // Request OTP for email verification
router.post('/auth/verify-otp', apiLimiter, verifyOTP); // Verify OTP
router.post('/auth/resend-otp', otpLimiter, resendOTP); // Resend OTP

// Auth routes - Password Reset (with rate limiting)
router.post('/auth/forgot-password', passwordResetLimiter, requestPasswordReset); // Request password reset OTP
router.post('/auth/verify-reset-otp', apiLimiter, verifyResetOTP); // Verify password reset OTP
router.post('/auth/reset-password', passwordResetLimiter, resetPassword); // Reset password with OTP
router.post('/auth/resend-reset-otp', passwordResetLimiter, resendResetOTP); // Resend password reset OTP

// Auth routes - Registration and Login (with rate limiting)
router.post('/signup', apiLimiter, signup);
router.post('/login', loginLimiter, login);
router.post('/logout', protect, logout);

// Admin-only Login Log routes (with stricter rate limiting)
router.get('/admin/login-logs', protect, adminOnly, adminLimiter, getLoginLogs); // Get all login logs
router.get('/admin/login-stats', protect, adminOnly, adminLimiter, getLoginStats); // Get login statistics
router.post('/admin/close-stale-sessions', protect, adminOnly, adminLimiter, closeStaleSession); // Close stale sessions

export default router

