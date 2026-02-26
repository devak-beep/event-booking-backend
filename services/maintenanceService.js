const maintenanceRepository = require('../repositories/maintenanceRepository');
const assetRepository = require('../repositories/assetRepository');
const { AppError } = require('../middleware/errorHandler');
const Maintenance = require('../models/Maintenance');

class MaintenanceService {
  async createMaintenance(maintenanceData) {
    const asset = await assetRepository.findById(maintenanceData.assetId);
    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    const maintenance = await maintenanceRepository.create(maintenanceData);
    return await maintenanceRepository.findById(maintenance._id);
  }

  async getAllMaintenance(filters) {
    return await maintenanceRepository.findAll(filters);
  }

  async updateMaintenance(id, updateData) {
    const maintenance = await maintenanceRepository.update(id, updateData);
    if (!maintenance) {
      throw new AppError('Maintenance record not found', 404);
    }
    return maintenance;
  }

  async completeMaintenance(id, completionData) {
    const maintenance = await Maintenance.findById(id);
    if (!maintenance) {
      throw new AppError('Maintenance record not found', 404);
    }

    // Update: nextDate becomes serviceDate, calculate new nextDate
    maintenance.serviceDate = maintenance.nextDate;
    maintenance.nextDate = maintenance.calculateNextDate();
    maintenance.status = 'completed';
    
    if (completionData.cost) maintenance.cost = completionData.cost;
    if (completionData.performedBy) maintenance.performedBy = completionData.performedBy;
    if (completionData.description) maintenance.description = completionData.description;

    await maintenance.save();

    // Create next maintenance schedule if not one-time
    if (maintenance.frequency !== 'one-time') {
      const nextMaintenance = await Maintenance.create({
        assetId: maintenance.assetId,
        type: maintenance.type,
        frequency: maintenance.frequency,
        serviceDate: maintenance.nextDate,
        status: 'pending',
        description: maintenance.description
      });
      return { completed: maintenance, next: nextMaintenance };
    }

    return { completed: maintenance, next: null };
  }

  async updateMaintenanceStatus() {
    const allMaintenance = await maintenanceRepository.findAll();
    const now = new Date();

    for (const maintenance of allMaintenance) {
      if (maintenance.status === 'completed') continue;

      if (maintenance.nextDate < now) {
        maintenance.status = 'overdue';
      } else {
        maintenance.status = 'pending';
      }
      await maintenance.save();
    }

    return { updated: allMaintenance.length };
  }
}

module.exports = new MaintenanceService();
