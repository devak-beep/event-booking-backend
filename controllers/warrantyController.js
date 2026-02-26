const warrantyService = require('../services/warrantyService');

class WarrantyController {
  async createWarranty(req, res, next) {
    try {
      const warranty = await warrantyService.createWarranty(req.body);
      res.status(201).json({ success: true, data: warranty });
    } catch (error) {
      next(error);
    }
  }

  async updateWarranty(req, res, next) {
    try {
      const warranty = await warrantyService.updateWarranty(req.params.id, req.body);
      res.status(200).json({ success: true, data: warranty });
    } catch (error) {
      next(error);
    }
  }

  async getAllWarranties(req, res, next) {
    try {
      const warranties = await warrantyService.getAllWarranties();
      res.status(200).json({ success: true, data: warranties });
    } catch (error) {
      next(error);
    }
  }

  async getExpiringWarranties(req, res, next) {
    try {
      const { days } = req.query;
      const warranties = await warrantyService.getExpiringWarranties(parseInt(days) || 30);
      res.status(200).json({ success: true, data: warranties });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new WarrantyController();
