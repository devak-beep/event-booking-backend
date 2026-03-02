const assignmentService = require('../services/assignmentService');

class AssignmentController {
  async assignAsset(req, res, next) {
    try {
      const { assetId, userId, notes } = req.body;
      const assignment = await assignmentService.assignAsset(assetId, userId, notes);
      res.status(201).json({ success: true, data: assignment });
    } catch (error) {
      next(error);
    }
  }

  async assignMultipleAssets(req, res, next) {
    try {
      const { assetIds, userId, notes } = req.body;
      if (!assetIds || !Array.isArray(assetIds)) {
        return res.status(400).json({ success: false, message: 'assetIds array required' });
      }
      const assignments = await assignmentService.assignMultipleAssets(assetIds, userId, notes);
      res.status(201).json({ success: true, data: assignments, count: assignments.length });
    } catch (error) {
      next(error);
    }
  }

  async getAllAssignments(req, res, next) {
    try {
      const { status, userId, page, limit } = req.query;
      const filters = {};
      if (status) filters.status = status;
      if (userId) filters.userId = userId;
      
      const assignments = await assignmentService.getAllAssignments(filters, { page: parseInt(page) || 1, limit: parseInt(limit) || 10 });
      res.status(200).json({ success: true, data: assignments });
    } catch (error) {
      next(error);
    }
  }

  async returnAsset(req, res, next) {
    try {
      const { assignmentId } = req.body;
      const assignment = await assignmentService.returnAsset(assignmentId);
      res.status(200).json({ success: true, data: assignment });
    } catch (error) {
      next(error);
    }
  }

  async getAssetHistory(req, res, next) {
    try {
      const { assetId } = req.params;
      const { page, limit } = req.query;
      const history = await assignmentService.getAssetHistory(assetId, { page: parseInt(page) || 1, limit: parseInt(limit) || 10 });
      res.status(200).json({ success: true, data: history });
    } catch (error) {
      next(error);
    }
  }

  async getAssignmentByAsset(req, res, next) {
    try {
      const { assetId } = req.params;
      const assignment = await assignmentService.getAssignmentByAsset(assetId);
      res.status(200).json({ success: true, data: assignment });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssignmentController();
