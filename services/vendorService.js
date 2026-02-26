const Vendor = require('../models/Vendor');
const { AppError } = require('../middleware/errorHandler');

class VendorService {
  async createVendor(vendorData) {
    const vendor = await Vendor.create(vendorData);
    return vendor;
  }

  async getVendors(filters, options) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const vendors = await Vendor.find(filters)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Vendor.countDocuments(filters);

    return {
      vendors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async getVendorById(id) {
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      throw new AppError('Vendor not found', 404);
    }
    return vendor;
  }

  async updateVendor(id, updateData) {
    const vendor = await Vendor.findByIdAndUpdate(id, updateData, { new: true });
    if (!vendor) {
      throw new AppError('Vendor not found', 404);
    }
    return vendor;
  }

  async deleteVendor(id) {
    const vendor = await Vendor.findByIdAndDelete(id);
    if (!vendor) {
      throw new AppError('Vendor not found', 404);
    }
    return vendor;
  }
}

module.exports = new VendorService();
