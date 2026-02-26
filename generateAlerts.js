require('dotenv').config();
const mongoose = require('mongoose');
require('./models/Asset');
require('./models/Warranty');
require('./models/Maintenance');
require('./models/Alert');
const alertService = require('./services/alertService');

const generateAlerts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const warranty = await alertService.generateWarrantyAlerts();
    const maintenance = await alertService.generateMaintenanceAlerts();
    
    console.log(`✅ Warranty alerts: ${warranty.generated}`);
    console.log(`✅ Maintenance alerts: ${maintenance.generated}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

generateAlerts();
