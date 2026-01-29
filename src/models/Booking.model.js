const mongoose = require("mongoose");

const BOOKING_STATUS = {
  INITIATED: "INITIATED",
  PAYMENT_PENDING: "PAYMENT_PENDING",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
  FAILED: "FAILED",
};

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    idempotencyKey: {
      type: String,
      unique: true,
      sparse: true,
    },

    seats: {
      type: [String],
      required: true,
    },

    status: {
      type: String,
      enum: Object.values(BOOKING_STATUS),
      default: BOOKING_STATUS.INITIATED,
    },

    seatLockId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SeatLock",
      unique: true,
    },

    paymentExpiresAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Booking", bookingSchema);
