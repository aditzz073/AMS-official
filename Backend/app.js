import express from "express"
import dotenv from "dotenv"
import cookieParser from "cookie-parser"
import cors from "cors"
import router from "./routers/router.js"

const app=express()
dotenv.config()

// Trust proxy for Render deployment
app.set('trust proxy', 1)

app.use(express.json({ limit: "50mb" }))
app.use(cookieParser()) 
app.use(express.urlencoded({ limit: "50mb", extended: true }))

// CORS Configuration - supports multiple origins
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
            console.warn(`CORS blocked origin: ${origin}`);
            callback(null, false);
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
})) 

// Serve uploaded documents (PDFs, docs, etc.)
app.use('/uploads/documents', express.static('uploads/documents'));

// Root endpoint - API info
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AMS API Server',
    version: '1.0',
    status: 'running',
    endpoints: {
      api: '/app/*',
      docs: '/uploads/documents/*'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ success: true, status: 'healthy', timestamp: new Date().toISOString() });
});

app.use("/app",router)


export default app