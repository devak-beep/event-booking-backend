const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MasterData',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedDate: {
    type: Date,
    default: Date.now
  },
  returnedDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['active', 'returned'],
    default: 'active'
  },
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Assignment', assignmentSchema);
