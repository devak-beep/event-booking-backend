const mongoose = require("mongoose");
const Booking = require("../models/Booking.model");
const SeatLock = require("../models/SeatLock.model");
const { BOOKING_STATUS } = require("../utils/bookingStateMachine");

const EXPIRY_INTERVAL_MINUTES = 1;

async function expireBookings() {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const now = new Date();

    // 1️⃣ Find expired bookings
    const expiredBookings = await Booking.find({
      status: BOOKING_STATUS.PAYMENT_PENDING,
      paymentExpiresAt: { $lt: now },
    }).session(session);

    if (expiredBookings.length === 0) {
      await session.commitTransaction();
      session.endSession();
      return;
    }

    for (const booking of expiredBookings) {
      // 2️⃣ Mark booking expired
      booking.status = BOOKING_STATUS.EXPIRED;
      await booking.save({ session });

      // 3️⃣ Remove seat lock if exists
      if (booking.seatLockId) {
        await SeatLock.deleteOne({ _id: booking.seatLockId }, { session });
      }
    }

    await session.commitTransaction();
    session.endSession();

    console.log(`[EXPIRY JOB] Expired ${expiredBookings.length} bookings`);
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("[EXPIRY JOB ERROR]", error.message);
  }
}

// Run every minute
setInterval(expireBookings, EXPIRY_INTERVAL_MINUTES * 60 * 1000);

module.exports = expireBookings;
