import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import router from "./routers/router.js"

const app=express()
dotenv.config()
app.use(express.json({ limit: "50mb" }))
app.use(cookieParser()) 
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// CORS Configuration - supports multiple origins (comma-separated in CLIENT_URL)
const allowedOrigins = process.env.CLIENT_URL ? 
  process.env.CLIENT_URL.split(',').map(origin => origin.trim()) : 
  ['http://localhost:5173'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, Postman, etc.)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
})) 

app.use("/app",router)

export default app