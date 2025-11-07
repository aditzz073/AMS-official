import mongoose from "mongoose";

const connection = async () => {
  try {
    const con = await mongoose.connect(process.env.MONGO_URI); // Uses URI from .env
    console.log("Successfully connected to database:", con.connection.host);
  } catch (err) {
    console.log("Failed to connect to database ERROR:", err);
    process.exit(1); // Exit process if DB connection fails
  }
};

export default connection;
