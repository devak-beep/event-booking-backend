const mongoose = require('mongoose');

const masterDataSchema = new mongoose.Schema({
  assetId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  assetType: {
    type: String,
    enum: ['assignable', 'non-assignable'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  serialNumber: {
    type: String,
    required: true,
    unique: true
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
  location: {
    type: String
  },
  condition: {
    type: String,
    enum: ['excellent', 'good', 'fair', 'poor']
  },
  status: {
    type: String,
    enum: ['available', 'assigned', 'under-repair', 'damaged', 'retired']
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
  }
}, { timestamps: true });

masterDataSchema.pre('save', async function() {
  if (!this.assetId) {
    const count = await mongoose.model('MasterData').countDocuments();
    this.assetId = `AST${String(count + 1).padStart(6, '0')}`;
  }
});

module.exports = mongoose.model('MasterData', masterDataSchema);
