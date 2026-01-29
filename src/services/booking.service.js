const Booking = require("../models/Booking.model");
const {
  canTransition,
  BOOKING_STATUS,
} = require("../utils/bookingStateMachine");

const PAYMENT_WINDOW_MINUTES = 10;

async function moveToPaymentPending(bookingId) {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    throw new Error("BOOKING_NOT_FOUND");
  }

  if (!canTransition(booking.status, BOOKING_STATUS.PAYMENT_PENDING)) {
    throw new Error("INVALID_STATE_TRANSITION");
  }

  booking.status = BOOKING_STATUS.PAYMENT_PENDING;
  booking.paymentExpiresAt = new Date(
    Date.now() + PAYMENT_WINDOW_MINUTES * 60 * 1000,
  );

  await booking.save();
  return booking;
}

module.exports = {
  moveToPaymentPending,
};
