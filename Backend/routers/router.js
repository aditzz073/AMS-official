import express from "express"
import evaluateScores from "../controller/calculate.js"
import { createOrUpdateEmployee, getAllEmployeeCodes, getEmployeeById } from "../controller/handelData.js"
import { login, logout, signup } from "../controller/authController.js"
import { requestOTP, verifyOTP, resendOTP } from "../controller/otpController.js"
import { requestPasswordReset, verifyResetOTP, resetPassword, resendResetOTP } from "../controller/passwordResetController.js"
import { getRemarks, updateRemarks, bulkUpdateRemarks } from "../controller/remarksController.js"
import { getLoginLogs, getLoginStats, closeStaleSession } from "../controller/loginLogController.js"
import uploadFields from "../middleware/multerMiddleware.js"
import { protect, adminOnly } from "../middleware/auth.js"

const router=express.Router()

router.post("/total",evaluateScores)
router.post("/addData", protect, uploadFields, createOrUpdateEmployee) // Protected route
router.get("/getData/:id", protect, getEmployeeById) // Protected route
router.get("/getEmpCode", protect, getAllEmployeeCodes) // Protected route

// Remarks routes
router.get("/remarks/:employeeCode", protect, getRemarks) // Get remarks
router.put("/remarks/:employeeCode", protect, updateRemarks) // Update single remark
router.put("/remarks/:employeeCode/bulk", protect, bulkUpdateRemarks) // Bulk update remarks

// Auth routes - OTP verification
router.post('/auth/request-otp', requestOTP); // Request OTP for email verification
router.post('/auth/verify-otp', verifyOTP); // Verify OTP
router.post('/auth/resend-otp', resendOTP); // Resend OTP

// Auth routes - Password Reset
router.post('/auth/forgot-password', requestPasswordReset); // Request password reset OTP
router.post('/auth/verify-reset-otp', verifyResetOTP); // Verify password reset OTP
router.post('/auth/reset-password', resetPassword); // Reset password with OTP
router.post('/auth/resend-reset-otp', resendResetOTP); // Resend password reset OTP

// Auth routes - Registration and Login
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', protect, logout);

// Admin-only Login Log routes
router.get('/admin/login-logs', protect, adminOnly, getLoginLogs); // Get all login logs
router.get('/admin/login-stats', protect, adminOnly, getLoginStats); // Get login statistics
router.post('/admin/close-stale-sessions', protect, adminOnly, closeStaleSession); // Close stale sessions

export default router

