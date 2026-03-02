require('dotenv').config();
const mongoose = require('mongoose');
const Asset = require('./models/Asset');
const Maintenance = require('./models/Maintenance');

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const maintenances = await Maintenance.find().limit(5);
    console.log('Checking maintenance records...\n');
    
    for (const m of maintenances) {
      const asset = await Asset.findById(m.assetId);
      console.log(`Maintenance ID: ${m._id}`);
      console.log(`AssetId: ${m.assetId}`);
      console.log(`Asset exists: ${asset ? 'YES - ' + asset.name : 'NO (DELETED)'}`);
      console.log('---');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

check();
