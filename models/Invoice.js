const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  invoiceImage: {
    type: String,
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  purchaseDate: {
    type: Date
  },
  totalAmount: {
    type: Number
  },
  extractedData: {
    type: mongoose.Schema.Types.Mixed
  },
  assets: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset'
  }],
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed'],
    default: 'pending'
  }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
