const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  assetId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['preventive', 'corrective', 'inspection']
  },
  frequency: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly', 'one-time'],
    required: true
  },
  serviceDate: {
    type: Date,
    required: true
  },
  nextDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'overdue'],
    default: 'pending'
  },
  description: {
    type: String
  },
  cost: {
    type: Number,
    default: 0
  },
  performedBy: {
    type: String
  }
}, { timestamps: true });

maintenanceSchema.methods.calculateNextDate = function() {
  const frequencyDays = {
    'weekly': 7,
    'monthly': 30,
    'quarterly': 90,
    'yearly': 365,
    'one-time': 0
  };
  
  const days = frequencyDays[this.frequency] || 0;
  if (days > 0) {
    return new Date(this.serviceDate.getTime() + days * 24 * 60 * 60 * 1000);
  }
  return null;
};

maintenanceSchema.pre('save', function() {
  if (!this.nextDate && this.serviceDate) {
    this.nextDate = this.calculateNextDate();
  }
});

module.exports = mongoose.model('Maintenance', maintenanceSchema);
