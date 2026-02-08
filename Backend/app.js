import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import router from "./routers/router.js"
import path from "path";
import { fileURLToPath } from "url";

const app=express()
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config()

// Trust proxy for Render deployment
app.set('trust proxy', 1)

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

// Serve uploaded documents (PDFs, docs, etc.)
app.use('/uploads/documents', express.static('uploads/documents'));

app.use("/app",router)

app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});


export default app