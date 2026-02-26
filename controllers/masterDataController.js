const masterDataService = require('../services/masterDataService');

class MasterDataController {
  async getMasterData(req, res, next) {
    try {
      const { assetType, status, page, limit } = req.query;
      const filters = {};
      if (assetType) filters.assetType = assetType;
      if (status) filters.status = status;

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 100
      };

      const result = await masterDataService.getMasterData(filters, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async exportMasterData(req, res, next) {
    try {
      const data = await masterDataService.exportMasterData();
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async syncFromAssets(req, res, next) {
    try {
      const result = await masterDataService.syncFromAssets();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MasterDataController();
