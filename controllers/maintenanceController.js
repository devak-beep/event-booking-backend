const maintenanceService = require('../services/maintenanceService');

class MaintenanceController {
  async createMaintenance(req, res, next) {
    try {
      const maintenance = await maintenanceService.createMaintenance(req.body);
      res.status(201).json({ success: true, data: maintenance });
    } catch (error) {
      next(error);
    }
  }

  async getAllMaintenance(req, res, next) {
    try {
      const { status, assetId } = req.query;
      const filters = {};
      if (status) filters.status = status;
      if (assetId) filters.assetId = assetId;

      const maintenance = await maintenanceService.getAllMaintenance(filters);
      res.status(200).json({ success: true, data: maintenance });
    } catch (error) {
      next(error);
    }
  }

  async updateMaintenance(req, res, next) {
    try {
      const maintenance = await maintenanceService.updateMaintenance(req.params.id, req.body);
      res.status(200).json({ success: true, data: maintenance });
    } catch (error) {
      next(error);
    }
  }

  async completeMaintenance(req, res, next) {
    try {
      const result = await maintenanceService.completeMaintenance(req.params.id, req.body);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MaintenanceController();
