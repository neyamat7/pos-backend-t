import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";

dotenv.config();

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express Server
    const PORT = process.env.PORT || 8000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`⚡ Server is running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
    });
  } catch (err) {
    console.error("Server failed to start:", err);
    process.exit(1); // Exit process if DB connection fails
  }
};

startServer();
