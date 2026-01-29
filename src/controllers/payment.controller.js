const Booking = require("../models/Booking.model");
const SeatLock = require("../models/SeatLock.model");
const Event = require("../models/Event.model");
const {
  BOOKING_STATUS,
  canTransition,
} = require("../utils/bookingStateMachine");
const mongoose = require("mongoose");

// ========== TASK 5.1: Payment Intent API ==========
exports.createPaymentIntent = async (req, res) => {
  const { bookingId, force } = req.body;

  // 1️⃣ Basic validation
  if (!bookingId || !force) {
    return res.status(400).json({
      success: false,
      message: "bookingId and force are required",
    });
  }

  if (!["success", "failure", "timeout"].includes(force)) {
    return res.status(400).json({
      success: false,
      message: "force must be success | failure | timeout",
    });
  }

  // 2️⃣ Fetch booking
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return res.status(404).json({
      success: false,
      message: "Booking not found",
    });
  }

  // 3️⃣ Only PAYMENT_PENDING bookings can accept payment
  if (booking.status !== BOOKING_STATUS.PAYMENT_PENDING) {
    return res.status(400).json({
      success: false,
      message: `Payment not allowed in ${booking.status} state`,
    });
  }

  // 4️⃣ Simulated outcomes
  if (force === "timeout") {
    // Do NOTHING — expiry job will handle it
    return res.status(200).json({
      success: true,
      paymentStatus: "TIMEOUT",
      message: "Payment timed out (simulated)",
    });
  }

  if (force === "failure") {
    // TASK 5.3: Payment Failure Flow
    return await handlePaymentFailure(bookingId, res);
  }

  // TASK 5.2: Payment Success Flow
  return await handlePaymentSuccess(bookingId, res);
};

// ========== TASK 5.2: Payment Success Flow ==========
async function handlePaymentSuccess(bookingId, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️⃣ Fetch booking with lock
    const booking = await Booking.findById(bookingId).session(session);

    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // 2️⃣ Verify state transition is valid
    if (!canTransition(booking.status, BOOKING_STATUS.CONFIRMED)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid state transition to CONFIRMED",
      });
    }

    // 3️⃣ Update booking to CONFIRMED
    booking.status = BOOKING_STATUS.CONFIRMED;
    await booking.save({ session });

    // 4️⃣ Consume seat lock (mark as CONSUMED)
    if (booking.seatLockId) {
      const lock = await SeatLock.findById(booking.seatLockId).session(session);

      if (lock) {
        lock.status = "CONSUMED";
        await lock.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      paymentStatus: "SUCCESS",
      message: "Payment successful and booking confirmed",
      booking: {
        id: booking._id,
        status: booking.status,
        event: booking.event,
        user: booking.user,
        seats: booking.seats,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      success: false,
      message: "Payment success processing failed",
      error: error.message,
    });
  }
}

// ========== TASK 5.3: Payment Failure Flow ==========
async function handlePaymentFailure(bookingId, res) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️⃣ Fetch booking
    const booking = await Booking.findById(bookingId).session(session);

    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    // 2️⃣ Verify state transition is valid
    if (!canTransition(booking.status, BOOKING_STATUS.FAILED)) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Invalid state transition to FAILED",
      });
    }

    // 3️⃣ Update booking to FAILED
    booking.status = BOOKING_STATUS.FAILED;
    await booking.save({ session });

    // 4️⃣ Release seats: Restore availableSeats in Event
    if (booking.seatLockId) {
      const lock = await SeatLock.findById(booking.seatLockId).session(session);

      if (lock) {
        // Release the locked seats back to the event
        const event = await Event.findById(lock.eventId).session(session);

        if (event) {
          event.availableSeats += lock.seats;
          event.availableSeats = Math.min(
            event.availableSeats,
            event.totalSeats,
          );
          await event.save({ session });
        }

        // Mark lock as EXPIRED (not consumable)
        lock.status = "EXPIRED";
        await lock.save({ session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
      success: true,
      paymentStatus: "FAILED",
      message: "Payment failed and seats have been released",
      booking: {
        id: booking._id,
        status: booking.status,
        event: booking.event,
        user: booking.user,
      },
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();

    return res.status(500).json({
      success: false,
      message: "Payment failure processing failed",
      error: error.message,
    });
  }
}
