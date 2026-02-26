// Script to sync invoiceImage from Asset to MasterData
const mongoose = require('mongoose');
require('dotenv').config();

const Asset = require('./models/Asset');
const MasterData = require('./models/MasterData');

async function syncInvoices() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all assets with invoiceImage
    const assetsWithInvoices = await Asset.find({ invoiceImage: { $exists: true, $ne: null } });
    console.log(`Found ${assetsWithInvoices.length} assets with invoices`);

    for (const asset of assetsWithInvoices) {
      const masterData = await MasterData.findOne({ serialNumber: asset.serialNumber });
      
      if (masterData) {
        masterData.invoiceImage = asset.invoiceImage;
        await masterData.save();
        console.log(`✓ Updated ${asset.serialNumber} - ${asset.invoiceImage}`);
      } else {
        console.log(`✗ No MasterData found for ${asset.serialNumber}`);
      }
    }

    console.log('\nSync complete!');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

syncInvoices();
