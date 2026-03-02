require('dotenv').config();
const mongoose = require('mongoose');
const Asset = require('./models/Asset');
const Maintenance = require('./models/Maintenance');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const records = await Maintenance.find().populate('assetId').limit(3);
    records.forEach(r => {
      console.log('ID:', r._id);
      console.log('AssetId:', r.assetId ? r.assetId.name : 'NULL');
      console.log('---');
    });
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();
