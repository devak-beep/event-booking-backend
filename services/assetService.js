const assetRepository = require('../repositories/assetRepository');
const { generateQRCode } = require('../utils/qrCode');
const { AppError } = require('../middleware/errorHandler');
const Invoice = require('../models/Invoice');

class AssetService {
  async createAsset(assetData) {
    const existing = await assetRepository.findBySerialNumber(assetData.serialNumber);
    if (existing) {
      throw new AppError('Serial number already exists', 400);
    }

    const asset = await assetRepository.create(assetData);
    asset.qrCode = generateQRCode(asset.assetId);
    await asset.save();

    // Sync to master data
    await this.syncAssetToMasterData(asset);

    return asset;
  }

  async createBulkAssets(assetData, quantity) {
    const createdAssets = [];
    const baseSerialNumber = assetData.serialNumber;

    for (let i = 1; i <= quantity; i++) {
      const serialNumber = quantity > 1 ? `${baseSerialNumber}-${i}` : baseSerialNumber;
      
      const asset = await this.createAsset({
        ...assetData,
        serialNumber
      });
      
      createdAssets.push(asset);
    }

    return createdAssets;
  }

  async createMultipleAssets(assetsData) {
    const createdAssets = [];
    
    for (const assetData of assetsData) {
      const asset = await this.createAsset(assetData);
      createdAssets.push(asset);
    }

    return createdAssets;
  }

  async syncAssetToMasterData(asset) {
    const MasterData = require('../models/MasterData');
    
    const masterDataObj = {
      assetId: asset.assetId,
      name: asset.name,
      assetType: asset.assetType,
      category: asset.category,
      brand: asset.brand,
      model: asset.model,
      serialNumber: asset.serialNumber,
      purchaseDate: asset.purchaseDate,
      purchaseCost: asset.purchaseCost,
      vendor: asset.vendor,
      location: asset.location,
      condition: asset.condition,
      status: asset.status,
      warrantyExpiryDate: asset.warrantyExpiryDate,
      amcExpiryDate: asset.amcExpiryDate,
      nextMaintenanceDate: asset.nextMaintenanceDate,
      assignedTo: asset.assignedTo,
      invoiceImage: asset.invoiceImage
    };

    const existing = await MasterData.findOne({ assetId: asset.assetId });
    if (existing) {
      await MasterData.findByIdAndUpdate(existing._id, masterDataObj);
    } else {
      await MasterData.create(masterDataObj);
    }
  }

  async createAssetsFromInvoice(invoiceData, assetsData) {
    const invoice = await Invoice.create({
      invoiceNumber: invoiceData.invoiceNumber,
      invoiceImage: invoiceData.invoiceImage,
      vendor: invoiceData.vendor,
      purchaseDate: invoiceData.purchaseDate,
      totalAmount: invoiceData.totalAmount,
      extractedData: invoiceData.extractedData
    });

    const createdAssets = [];
    for (const assetData of assetsData) {
      const asset = await this.createAsset({
        ...assetData,
        invoiceImage: invoiceData.invoiceImage,
        vendor: invoiceData.vendor,
        purchaseDate: invoiceData.purchaseDate
      });
      createdAssets.push(asset);
    }

    invoice.assets = createdAssets.map(a => a._id);
    invoice.status = 'processed';
    await invoice.save();

    return { invoice, assets: createdAssets };
  }

  async getMasterData() {
    const assets = await assetRepository.findAll({}, { page: 1, limit: 10000 });
    return assets;
  }

  async getAssets(filters, options) {
    const { userId, userRole } = options;
    
    // Role-based filtering
    if (userRole === 'user') {
      // Users only see their assigned assets
      const Assignment = require('../models/Assignment');
      const assignments = await Assignment.find({ userId, status: 'active' }).select('assetId');
      filters._id = { $in: assignments.map(a => a.assetId) };
    } else if (userRole === 'manager') {
      // Managers see their own assigned assets
      const Assignment = require('../models/Assignment');
      const assignments = await Assignment.find({ userId, status: 'active' }).select('assetId');
      filters._id = { $in: assignments.map(a => a.assetId) };
    } else if (userRole === 'hr') {
      // HR sees their own assigned assets
      const Assignment = require('../models/Assignment');
      const assignments = await Assignment.find({ userId, status: 'active' }).select('assetId');
      filters._id = { $in: assignments.map(a => a.assetId) };
    }
    // admin sees all assets (no filter)
    
    return await assetRepository.findAll(filters, options);
  }

  async getAssetById(id) {
    const asset = await assetRepository.findById(id);
    if (!asset) {
      throw new AppError('Asset not found', 404);
    }
    return asset;
  }

  async updateAsset(id, updateData) {
    const asset = await assetRepository.update(id, updateData);
    if (!asset) {
      throw new AppError('Asset not found', 404);
    }
    return asset;
  }

  async deleteAsset(id) {
    const asset = await assetRepository.delete(id);
    if (!asset) {
      throw new AppError('Asset not found', 404);
    }
    return asset;
  }
}

module.exports = new AssetService();
