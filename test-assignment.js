// Quick test to verify Assignment populate works
const mongoose = require('mongoose');
require('dotenv').config();

const Assignment = require('./models/Assignment');

async function test() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const assignments = await Assignment.find()
      .populate('assetId')
      .populate('userId')
      .limit(3);

    console.log('\nAssignments found:', assignments.length);
    
    assignments.forEach((a, i) => {
      console.log(`\n--- Assignment ${i + 1} ---`);
      console.log('Asset ID:', a.assetId?._id);
      console.log('Asset Name:', a.assetId?.name || 'NOT POPULATED');
      console.log('User Name:', a.userId?.name);
      console.log('Status:', a.status);
      console.log('Notes:', a.notes);
    });

    await mongoose.disconnect();
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
