const express = require("express");
require("express-async-errors");

const userRoutes = require("./routes/user.routes");
const eventRoutes = require("./routes/event.routes");
const lockRoutes = require("./routes/lock.routes");
const bookingRoutes = require("./routes/booking.routes");

const app = express();

app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/locks", lockRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", require("./routes/payment.routes"));

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

module.exports = app;
