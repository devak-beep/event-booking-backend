const SeatLock = require("../models/SeatLock.model");
const Event = require("../models/Event.model");
const Booking = require("../models/Booking.model");

exports.confirmBooking = async (req, res) => {
  const { lockId } = req.body;

  // ✅ Basic validation
  if (!lockId) {
    return res.status(400).json({
      success: false,
      message: "lockId is required",
    });
  }

  // 1️⃣ Validate lock existence
  const lock = await SeatLock.findById(lockId);
  if (!lock) {
    return res.status(400).json({
      success: false,
      message: "Invalid or expired lock",
    });
  }

  // 2️⃣ Check lock expiration
  if (lock.expiresAt < new Date()) {
    await SeatLock.findByIdAndDelete(lockId);
    return res.status(400).json({
      success: false,
      message: "Lock expired",
    });
  }

  // 3️⃣ Validate event existence
  const event = await Event.findById(lock.eventId);
  if (!event) {
    return res.status(404).json({
      success: false,
      message: "Event not found",
    });
  }

  // ⚠️ IMPORTANT DESIGN NOTE
  // Seats are already deducted during LOCK phase.
  // DO NOT deduct seats again here.

  // 4️⃣ Create booking (schema-aligned)
  const booking = await Booking.create({
    event: lock.eventId,
    user: lock.userId, // required by Booking schema
    seats: lock.seats,
    totalPrice: lock.seats * 100, // dummy pricing for now
  });

  // 5️⃣ Remove lock after successful booking
  await SeatLock.findByIdAndDelete(lockId);

  // 6️⃣ Send success response
  res.status(201).json({
    success: true,
    booking,
  });
};
