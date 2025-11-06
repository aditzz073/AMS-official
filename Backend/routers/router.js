import express from "express"
import evaluateScores from "../controller/calculate.js"
import { createOrUpdateEmployee, getAllEmployeeCodes, getEmployeeById } from "../controller/handelData.js"
import { login, logout, signup } from "../controller/authController.js"
import uploadFields from "../middleware/multerMiddleware.js"
const router=express.Router()

router.post("/total",evaluateScores)
router.post("/addData",uploadFields,createOrUpdateEmployee)
router.get("/getData/:id",getEmployeeById)
router.get("/getEmpCode",getAllEmployeeCodes)


router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

export default router

