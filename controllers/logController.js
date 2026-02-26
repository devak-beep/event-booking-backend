const activityLogService = require('../services/activityLogService');
const errorLogService = require('../services/errorLogService');

class LogController {
  async getActivityLogs(req, res, next) {
    try {
      const { entity, userId, page, limit } = req.query;
      const filters = {};
      if (entity) filters.entity = entity;
      if (userId) filters.userId = userId;

      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 50 };
      const result = await activityLogService.getActivityLogs(filters, options);
      
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getErrorLogs(req, res, next) {
    try {
      const { page, limit } = req.query;
      const options = { page: parseInt(page) || 1, limit: parseInt(limit) || 50 };
      const result = await errorLogService.getErrorLogs({}, options);
      
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LogController();
