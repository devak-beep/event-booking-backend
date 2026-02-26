const ActivityLog = require('../models/ActivityLog');

class ActivityLogRepository {
  async create(logData) {
    return await ActivityLog.create(logData);
  }

  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const logs = await ActivityLog.find(filters)
      .populate('userId', 'name email')
      .sort('-timestamp')
      .skip(skip)
      .limit(limit);

    const total = await ActivityLog.countDocuments(filters);

    return {
      logs,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    };
  }
}

module.exports = new ActivityLogRepository();
