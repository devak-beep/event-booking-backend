const alertService = require('../services/alertService');

class AlertController {
  async getAllAlerts(req, res, next) {
    try {
      const { status, type, page, limit } = req.query;
      const filters = {};
      if (status) filters.status = status;
      if (type) filters.type = type;

      const alerts = await alertService.getAllAlerts(filters, { page: parseInt(page) || 1, limit: parseInt(limit) || 10 });
      res.status(200).json({ success: true, data: alerts });
    } catch (error) {
      next(error);
    }
  }

  async updateAlert(req, res, next) {
    try {
      const alert = await alertService.updateAlert(req.params.id, req.body);
      res.status(200).json({ success: true, data: alert });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AlertController();
