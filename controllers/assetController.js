const assetService = require('../services/assetService');

class AssetController {
  async createAsset(req, res, next) {
    try {
      const asset = await assetService.createAsset(req.body);
      res.status(201).json({ success: true, data: asset });
    } catch (error) {
      next(error);
    }
  }

  async createBulkAssets(req, res, next) {
    try {
      const { quantity, ...assetData } = req.body;
      const qty = parseInt(quantity) || 1;
      
      // Add invoice image path if uploaded
      if (req.file) {
        assetData.invoiceImage = req.file.path;
      }
      
      const assets = await assetService.createBulkAssets(assetData, qty);
      res.status(201).json({ success: true, data: assets, count: assets.length });
    } catch (error) {
      next(error);
    }
  }

  async createMultipleAssets(req, res, next) {
    try {
      const { assets } = req.body;
      if (!assets || !Array.isArray(assets)) {
        return res.status(400).json({ success: false, message: 'Assets array required' });
      }
      const createdAssets = await assetService.createMultipleAssets(assets);
      res.status(201).json({ success: true, data: createdAssets, count: createdAssets.length });
    } catch (error) {
      next(error);
    }
  }

  async createAssetsFromInvoice(req, res, next) {
    try {
      const { invoiceData, assets } = req.body;
      const result = await assetService.createAssetsFromInvoice(invoiceData, assets);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getMasterData(req, res, next) {
    try {
      const result = await assetService.getMasterData();
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAssets(req, res, next) {
    try {
      const { status, type, location, page, limit, sort, assetType } = req.query;
      
      const filters = {};
      if (status) filters.status = status;
      if (type) filters.type = type;
      if (location) filters.location = location;
      if (assetType) filters.assetType = assetType;

      const options = { 
        page: parseInt(page) || 1, 
        limit: parseInt(limit) || 10, 
        sort,
        userId: req.user._id,
        userRole: req.user.role
      };

      const result = await assetService.getAssets(filters, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getAssetById(req, res, next) {
    try {
      const asset = await assetService.getAssetById(req.params.id);
      res.status(200).json({ success: true, data: asset });
    } catch (error) {
      next(error);
    }
  }

  async updateAsset(req, res, next) {
    try {
      const asset = await assetService.updateAsset(req.params.id, req.body);
      res.status(200).json({ success: true, data: asset });
    } catch (error) {
      next(error);
    }
  }

  async deleteAsset(req, res, next) {
    try {
      await assetService.deleteAsset(req.params.id);
      res.status(200).json({ success: true, message: 'Asset deleted' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AssetController();
