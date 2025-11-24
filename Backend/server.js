import dotenv from "dotenv";
dotenv.config(); // Load .env variables

import app from "./app.js";
import connection from "./dbConnect.js";
import cloudinary from "cloudinary";

// Connect to MongoDB
connection();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

export default cloudinary;

