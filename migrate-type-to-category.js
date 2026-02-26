const mongoose = require('mongoose');
require('dotenv').config();

async function migrate() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const Asset = mongoose.connection.collection('assets');
    const assets = await Asset.find({ type: { $exists: true } }).toArray();

    console.log(`Found ${assets.length} assets to migrate\n`);

    for (const asset of assets) {
      const category = asset.type;
      const name = `${asset.brand} ${asset.model}`;
      
      await Asset.updateOne(
        { _id: asset._id },
        { 
          $set: { category, name },
          $unset: { type: "" }
        }
      );
      
      console.log(`✅ ${asset.serialNumber}: ${name} (${category})`);
    }

    console.log('\n✅ Migration complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

migrate();
