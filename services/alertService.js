const alertRepository = require('../repositories/alertRepository');
const warrantyRepository = require('../repositories/warrantyRepository');
const maintenanceRepository = require('../repositories/maintenanceRepository');

class AlertService {
  async generateWarrantyAlerts() {
    const expiring = await warrantyRepository.findExpiring(30);
    let count = 0;

    for (const warranty of expiring) {
      await alertRepository.deleteByAssetAndType(warranty.assetId._id, 'warranty-expiry');
      await alertRepository.deleteByAssetAndType(warranty.assetId._id, 'amc-expiry');

      const now = new Date();
      if (warranty.warrantyExpiry > now) {
        await alertRepository.create({
          assetId: warranty.assetId._id,
          type: 'warranty-expiry',
          message: `Warranty expiring soon for ${warranty.assetId.assetId}`,
          dueDate: warranty.warrantyExpiry
        });
        count++;
      }

      if (warranty.amcExpiry && warranty.amcExpiry > now) {
        await alertRepository.create({
          assetId: warranty.assetId._id,
          type: 'amc-expiry',
          message: `AMC expiring soon for ${warranty.assetId.assetId}`,
          dueDate: warranty.amcExpiry
        });
        count++;
      }
    }

    return { generated: count };
  }

  async generateMaintenanceAlerts() {
    const overdue = await maintenanceRepository.findOverdue();
    let count = 0;

    for (const maintenance of overdue) {
      await alertRepository.deleteByAssetAndType(maintenance.assetId._id, 'maintenance-overdue');
      
      await alertRepository.create({
        assetId: maintenance.assetId._id,
        type: 'maintenance-overdue',
        message: `Maintenance overdue for ${maintenance.assetId.assetId}`,
        dueDate: maintenance.nextDate
      });
      count++;
    }

    return { generated: count };
  }

  async getAllAlerts(filters) {
    return await alertRepository.findAll(filters);
  }

  async updateAlert(id, updateData) {
    return await alertRepository.update(id, updateData);
  }
}

module.exports = new AlertService();
