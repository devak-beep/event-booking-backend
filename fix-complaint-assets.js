const mongoose = require('mongoose');
require('dotenv').config();

const Asset = require('./models/Asset');
const Complaint = require('./models/Complaint');

async function updateAssets() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find all active complaints
    const complaints = await Complaint.find({ status: { $ne: 'completed' } });
    
    console.log(`Found ${complaints.length} active complaints`);
    
    for (const complaint of complaints) {
      const result = await Asset.findByIdAndUpdate(complaint.assetId, { status: 'damage' });
      console.log(`Updated asset ${complaint.assetId} to damage`);
    }
    
    console.log('✅ Done updating assets');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

updateAssets();
