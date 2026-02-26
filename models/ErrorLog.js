const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema({
  correlationId: {
    type: String,
    required: true,
    index: true
  },
  error: {
    type: String,
    required: true
  },
  stack: {
    type: String
  },
  endpoint: {
    type: String
  },
  method: {
    type: String
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('ErrorLog', errorLogSchema);
