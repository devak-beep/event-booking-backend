const express = require("express");
const router = express.Router();

const {
  createEvent,
  getEventById,
  lockSeats,
} = require("../controllers/event.controller");

// Create a new event
router.post("/", createEvent);

// Get event details
router.get("/:id", getEventById);

// Lock seats for an event (EPIC 3 – Task 3.2)
router.post("/:eventId/lock", lockSeats);

module.exports = router;
