import dotenv from "dotenv";
dotenv.config(); // Load .env variables

import app from "./app.js";
import connection from "./dbConnect.js";
import cloudinary from "cloudinary";
import path from "path";
import { fileURLToPath } from "url";
import { createEmployeeService } from "./services/employeeService.js";
import { setEmployeeService } from "./controller/authController.js";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to MongoDB
connection();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// Initialize Employee Service
const initializeEmployeeService = async () => {
  try {
    console.log('Initializing Employee Service...');
    
    const csvDirectory = process.env.CSV_DIRECTORY || path.join(__dirname, 'Faculty data');
    
    const employeeService = createEmployeeService({
      csvDirectory,
      enableFileWatch: process.env.NODE_ENV !== 'test', // Disable in test environment
      streamingMode: false, // Use in-memory cache by default
      cacheTTL: 0, // No expiration
    });

    await employeeService.initialize();
    
    // Inject the service into auth controller
    setEmployeeService(employeeService);

    const stats = employeeService.getCacheStats();
    console.log('Employee Service initialized successfully');
    console.log(`Loaded ${stats.employeeCount} employee records from ${csvDirectory}`);
    
    return employeeService;
  } catch (error) {
    console.error('Failed to initialize Employee Service:', error.message);
    console.error('Server will continue but employee verification will be disabled.');
    return null;
  }
};

const PORT = process.env.PORT || 5000;

// Start server after initializing employee service
const startServer = async () => {
  // Initialize employee service (non-blocking for server start)
  await initializeEmployeeService();

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

export default cloudinary;

