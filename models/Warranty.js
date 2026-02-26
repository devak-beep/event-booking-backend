const mongoose = require('mongoose');

const warrantySchema = new mongoose.Schema({
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true,
    unique: true
  },
  warrantyExpiry: {
    type: Date,
    required: true
  },
  amcExpiry: {
    type: Date
  },
  vendor: {
    type: String,
    required: true,
    trim: true
  },
  cost: {
    type: Number,
    default: 0
  },
  isWarrantyExpired: {
    type: Boolean,
    default: false
  },
  isAmcExpired: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

warrantySchema.pre('save', function() {
  const now = new Date();
  this.isWarrantyExpired = this.warrantyExpiry < now;
  if (this.amcExpiry) {
    this.isAmcExpired = this.amcExpiry < now;
  }
});

module.exports = mongoose.model('Warranty', warrantySchema);
