import express from "express"
import evaluateScores from "../controller/calculate.js"
import { createOrUpdateEmployee, getAllEmployeeCodes, getEmployeeById } from "../controller/handelData.js"
import { login, logout, signup } from "../controller/authController.js"
import { getRemarks, updateRemarks, bulkUpdateRemarks } from "../controller/remarksController.js"
import uploadFields from "../middleware/multerMiddleware.js"
import { protect } from "../middleware/auth.js"

const router=express.Router()

router.post("/total",evaluateScores)
router.post("/addData", protect, uploadFields, createOrUpdateEmployee) // Protected route
router.get("/getData/:id", protect, getEmployeeById) // Protected route
router.get("/getEmpCode", protect, getAllEmployeeCodes) // Protected route

// Remarks routes
router.get("/remarks/:employeeCode", protect, getRemarks) // Get remarks
router.put("/remarks/:employeeCode", protect, updateRemarks) // Update single remark
router.put("/remarks/:employeeCode/bulk", protect, bulkUpdateRemarks) // Bulk update remarks

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

export default router

