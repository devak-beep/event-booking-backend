const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  assetId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  assetType: {
    type: String,
    enum: ['assignable', 'non-assignable'],
    default: 'assignable'
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['available', 'assigned', 'under-repair', 'damaged', 'retired'],
    default: 'available'
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor'],
    default: 'good'
  },
  purchaseDate: {
    type: Date
  },
  purchaseCost: {
    type: Number
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor'
  },
  warrantyExpiryDate: {
    type: Date
  },
  amcExpiryDate: {
    type: Date
  },
  nextMaintenanceDate: {
    type: Date
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  invoiceImage: {
    type: String
  },
  qrCode: {
    type: String
  }
}, { timestamps: true });

assetSchema.index({ serialNumber: 1 });

assetSchema.pre('save', async function() {
  if (!this.assetId) {
    const count = await mongoose.model('Asset').countDocuments();
    this.assetId = `AST${String(count + 1).padStart(6, '0')}`;
  }
});

module.exports = mongoose.model('Asset', assetSchema);
