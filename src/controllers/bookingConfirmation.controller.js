const {
  confirmBookingTransactional,
} = require("../services/bookingConfirmation.service");

exports.confirmBooking = async (req, res) => {
  try {
    // Support both: POST /api/bookings/confirm (body) and POST /api/bookings/:id/confirm (URL)
    const lockId = req.body.lockId || req.params.id;

    if (!lockId) {
      return res.status(400).json({
        success: false,
        message: "lockId is required (in body or URL)",
      });
    }

    const booking = await confirmBookingTransactional(lockId);

    res.status(201).json({
      success: true,
      booking,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
