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
app.use(cors({
    origin:process.env.CLIENT_URL,
    credentials:true
})) 

// app.use("/",(req,res)=>{
//     res.send("Hello")
// })
app.use("/app",router)

export default app