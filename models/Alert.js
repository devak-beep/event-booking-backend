const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  type: {
    type: String,
    enum: ['warranty-expiry', 'amc-expiry', 'maintenance-overdue', 'maintenance-due'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  dueDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'dismissed'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Alert', alertSchema);
