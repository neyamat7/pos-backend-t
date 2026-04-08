import https from "https";
import http from "http";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import app from "./app.js";

dotenv.config();

/**
 * Keep-alive mechanism for Render free tier.
 * It pings the server URL every 14 minutes to prevent spin-down.
 */
const keepAlive = (url) => {
  if (!url) return;

  const protocol = url.startsWith("https") ? https : http;

  console.log(`Keep-alive started for: ${url}`);

  setInterval(() => {
    try {
      protocol.get(url, (res) => {
        console.log(`Ping status: ${res.statusCode} at ${new Date().toLocaleTimeString()}`);
      }).on("error", (err) => {
        console.error("Keep-alive ping error:", err.message);
      });
    } catch (err) {
      console.error("Keep-alive exception caught:", err.message);
    }
  }, 14 * 60 * 1000);
};

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express Server
    const PORT = process.env.PORT || 8000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`⚡ Server is running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);

      // Start keep-alive if URL is provided
      if (process.env.KEEP_ALIVE_URL) {
        keepAlive(process.env.KEEP_ALIVE_URL);
      }
    });
  } catch (err) {
    console.error("Server failed to start:", err);
    process.exit(1); // Exit process if DB connection fails
  }
};

startServer();
