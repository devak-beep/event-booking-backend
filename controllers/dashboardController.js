const dashboardService = require('../services/dashboardService');

class DashboardController {
  async getSummary(req, res, next) {
    try {
      const summary = await dashboardService.getSummary();
      res.status(200).json({ success: true, data: summary });
    } catch (error) {
      next(error);
    }
  }

  async getAnalytics(req, res, next) {
    try {
      const analytics = await dashboardService.getSmartInsights();
      res.status(200).json({ success: true, data: analytics });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new DashboardController();
