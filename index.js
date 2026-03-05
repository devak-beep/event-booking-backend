require("dotenv").config();
const mongoose = require("mongoose");

// Disable buffering globally
mongoose.set('bufferCommands', false);

let app = null;
let connectionPromise = null;

// Start connection on cold start
if (!connectionPromise) {
  connectionPromise = mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  }).catch(err => {
    console.error("MongoDB connection failed:", err.message);
    connectionPromise = null;
    throw err;
  });
}

module.exports = async (req, res) => {
  // Handle OPTIONS preflight
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Origin", "https://eventix-frontend-8v2j.vercel.app");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Correlation-ID,x-user-id,x-user-role");
    return res.status(200).end();
  }

  try {
    // Wait for connection to complete
    if (connectionPromise) {
      await connectionPromise;
    }

    // Load app once
    if (!app) {
      app = require("./src/app");
    }

    return app(req, res);
  } catch (error) {
    console.error("Handler error:", error.message);
    if (!res.headersSent) {
      return res.status(500).json({
        error: "Server error",
        message: error.message,
      });
    }
  }
};
