const Asset = require('../models/Asset');

class DashboardService {
  async getSummary() {
    const total = await Asset.countDocuments();
    const assigned = await Asset.countDocuments({ status: 'assigned' });
    const available = await Asset.countDocuments({ status: 'available' });
    const damaged = await Asset.countDocuments({ status: 'damaged' });
    const underRepair = await Asset.countDocuments({ status: 'under-repair' });

    return {
      total,
      assigned,
      available,
      damaged,
      underRepair
    };
  }

  async getSmartInsights() {
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);

    // Old devices > 3 years
    const oldDevices = await Asset.find({
      purchaseDate: { $lt: threeYearsAgo }
    }).select('assetId type brand model purchaseDate');

    // Frequent repair assets (damaged or under-repair)
    const frequentRepair = await Asset.find({
      status: { $in: ['damaged', 'under-repair'] }
    }).select('assetId type brand model status');

    // High cost maintenance
    const Maintenance = require('../models/Maintenance');
    const highCostMaintenance = await Maintenance.aggregate([
      {
        $group: {
          _id: '$assetId',
          totalCost: { $sum: '$cost' },
          count: { $sum: 1 }
        }
      },
      {
        $match: { totalCost: { $gt: 5000 } }
      },
      {
        $lookup: {
          from: 'assets',
          localField: '_id',
          foreignField: '_id',
          as: 'asset'
        }
      },
      {
        $unwind: '$asset'
      },
      {
        $project: {
          assetId: '$asset.assetId',
          type: '$asset.type',
          brand: '$asset.brand',
          totalCost: 1,
          count: 1
        }
      },
      {
        $sort: { totalCost: -1 }
      }
    ]);

    return {
      oldDevices: oldDevices.length,
      oldDevicesList: oldDevices,
      frequentRepair: frequentRepair.length,
      frequentRepairList: frequentRepair,
      highCostMaintenance: highCostMaintenance.length,
      highCostMaintenanceList: highCostMaintenance
    };
  }
}

module.exports = new DashboardService();
