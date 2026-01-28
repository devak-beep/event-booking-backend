const express = require("express");
require("express-async-errors");

const eventRoutes = require("./routes/event.routes");
const lockRoutes = require("./routes/lock.routes");
const bookingRoutes = require("./routes/booking.routes"); // 👈 ADD

const app = express();

app.use(express.json());

// Routes
app.use("/events", eventRoutes);
app.use("/locks", lockRoutes);
app.use("/bookings", bookingRoutes); // 👈 ADD

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

module.exports = app;
