require('dotenv').config();
const mongoose = require('mongoose');
const Maintenance = require('./models/Maintenance');

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    const result = await Maintenance.deleteMany({ assetId: null });
    console.log(`Deleted ${result.deletedCount} maintenance records with null assetId`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

cleanup();
