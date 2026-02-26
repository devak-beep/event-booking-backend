const vendorService = require('../services/vendorService');

class VendorController {
  async createVendor(req, res, next) {
    try {
      const vendor = await vendorService.createVendor(req.body);
      res.status(201).json({ success: true, data: vendor });
    } catch (error) {
      next(error);
    }
  }

  async getVendors(req, res, next) {
    try {
      const { type, city, page, limit } = req.query;
      const filters = {};
      if (type) filters.type = type;
      if (city) filters.city = city;

      const options = {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 10
      };

      const result = await vendorService.getVendors(filters, options);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  async getVendorById(req, res, next) {
    try {
      const vendor = await vendorService.getVendorById(req.params.id);
      res.status(200).json({ success: true, data: vendor });
    } catch (error) {
      next(error);
    }
  }

  async updateVendor(req, res, next) {
    try {
      const vendor = await vendorService.updateVendor(req.params.id, req.body);
      res.status(200).json({ success: true, data: vendor });
    } catch (error) {
      next(error);
    }
  }

  async deleteVendor(req, res, next) {
    try {
      await vendorService.deleteVendor(req.params.id);
      res.status(200).json({ success: true, message: 'Vendor deleted' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VendorController();
