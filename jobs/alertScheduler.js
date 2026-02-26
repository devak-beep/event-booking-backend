const cron = require('node-cron');
const alertService = require('../services/alertService');
const maintenanceService = require('../services/maintenanceService');

const startScheduler = () => {
  // Run daily at 9 AM
  cron.schedule('0 9 * * *', async () => {
    console.log('🔔 Running daily alert scheduler...');
    
    try {
      await maintenanceService.updateMaintenanceStatus();
      const warrantyAlerts = await alertService.generateWarrantyAlerts();
      const maintenanceAlerts = await alertService.generateMaintenanceAlerts();
      
      console.log(`✅ Generated ${warrantyAlerts.generated} warranty alerts`);
      console.log(`✅ Generated ${maintenanceAlerts.generated} maintenance alerts`);
    } catch (error) {
      console.error('❌ Scheduler error:', error.message);
    }
  });

  console.log('⏰ Alert scheduler started (runs daily at 9 AM)');
};

module.exports = { startScheduler };
