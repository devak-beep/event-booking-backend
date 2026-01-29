const express = require("express");
const router = express.Router();

const {
  confirmBooking,
} = require("../controllers/bookingConfirmation.controller");

// POST /api/bookings/confirm with lockId in body
router.post("/confirm", confirmBooking);

// Alternative: POST /api/bookings/:id/confirm with lockId in URL
router.post("/:id/confirm", confirmBooking);

module.exports = router;
