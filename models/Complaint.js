const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true },
  assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'medium' },
  status: { type: String, enum: ['new', 'acknowledged', 'in-progress', 'completed'], default: 'new' },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  resolvedAt: Date,
  resolution: String
}, { timestamps: true });

complaintSchema.pre('save', async function() {
  if (!this.ticketId) {
    const count = await mongoose.model('Complaint').countDocuments();
    this.ticketId = `TKT-${String(count + 1).padStart(6, '0')}`;
  }
});

module.exports = mongoose.model('Complaint', complaintSchema);
