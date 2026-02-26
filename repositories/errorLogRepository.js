const ErrorLog = require('../models/ErrorLog');

class ErrorLogRepository {
  async create(logData) {
    return await ErrorLog.create(logData);
  }

  async findAll(filters = {}, options = {}) {
    const { page = 1, limit = 50 } = options;
    const skip = (page - 1) * limit;

    const logs = await ErrorLog.find(filters)
      .sort('-timestamp')
      .skip(skip)
      .limit(limit);

    const total = await ErrorLog.countDocuments(filters);

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

module.exports = new ErrorLogRepository();
