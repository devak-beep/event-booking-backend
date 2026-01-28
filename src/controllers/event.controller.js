const mongoose = require("mongoose");
const Event = require("../models/Event.model");
const SeatLock = require("../models/SeatLock.model");

/**
 * Create a new event
 */
exports.createEvent = async (req, res) => {
  const { name, description, eventDate, totalSeats } = req.body;

  if (!name || !eventDate || !totalSeats) {
    return res.status(400).json({
      success: false,
      message: "name, eventDate and totalSeats are required",
    });
  }

  const event = await Event.create({
    name,
    description,
    eventDate,
    totalSeats,
    availableSeats: totalSeats,
  });

  res.status(201).json({
    success: true,
    data: event,
  });
};

/**
 * Get event details by ID
 */
exports.getEventById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid event ID",
    });
  }

  const event = await Event.findById(id).select(
    "name description eventDate totalSeats availableSeats createdAt",
  );

  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found",
    });
  }

  res.status(200).json({
    success: true,
    data: event,
  });
};

/**
 * Lock seats (EPIC 3 – Task 3.2 + 3.3)
 */
exports.lockSeats = async (req, res) => {
  const { eventId } = req.params;
  const { seats, idempotencyKey } = req.body;

  if (!seats || seats <= 0 || !idempotencyKey) {
    return res.status(400).json({
      success: false,
      message: "seats and idempotencyKey are required",
    });
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Idempotency check
    const existingLock = await SeatLock.findOne({
      eventId,
      idempotencyKey,
    }).session(session);

    if (existingLock) {
      await session.commitTransaction();
      session.endSession();

      return res.status(200).json({
        success: true,
        lockId: existingLock._id,
        expiresAt: existingLock.expiresAt,
        message: "Idempotent replay",
      });
    }

    const event = await Event.findById(eventId).session(session);

    if (!event) {
      throw new Error("Event not found");
    }

    if (event.availableSeats < seats) {
      throw new Error("Not enough seats available");
    }

    // Deduct seats
    event.availableSeats -= seats;
    await event.save({ session });

    // Create seat lock
    const lock = await SeatLock.create(
      [
        {
          eventId,
          seats,
          idempotencyKey,
          status: "ACTIVE",
          expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        },
      ],
      { session },
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      lockId: lock[0]._id,
      expiresAt: lock[0].expiresAt,
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();

    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};
