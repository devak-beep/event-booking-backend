const mongoose = require("mongoose");

const seatLockSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    seats: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["ACTIVE", "EXPIRED", "CONSUMED"],
      default: "ACTIVE",
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    idempotencyKey: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true },
);

seatLockSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

if (mongoose.models.SeatLock) {
  delete mongoose.models.SeatLock;
}

module.exports = mongoose.model("SeatLock", seatLockSchema);
