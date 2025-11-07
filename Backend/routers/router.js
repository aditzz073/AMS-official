import express from "express"
import evaluateScores from "../controller/calculate.js"
import { createOrUpdateEmployee, getAllEmployeeCodes, getEmployeeById } from "../controller/handelData.js"
import { login, logout, signup } from "../controller/authController.js"
import uploadFields from "../middleware/multerMiddleware.js"
import { protect } from "../middleware/auth.js"

const router=express.Router()

router.post("/total",evaluateScores)
router.post("/addData", protect, uploadFields, createOrUpdateEmployee) // Protected route
router.get("/getData/:id", protect, getEmployeeById) // Protected route
router.get("/getEmpCode", protect, getAllEmployeeCodes) // Protected route

router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

export default router

