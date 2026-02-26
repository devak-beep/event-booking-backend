const activityLogRepository = require('../repositories/activityLogRepository');

class ActivityLogService {
  async log(userId, action, entity, entityId, changes = null) {
    return await activityLogRepository.create({
      userId,
      action,
      entity,
      entityId,
      changes
    });
  }

  async getActivityLogs(filters, options) {
    return await activityLogRepository.findAll(filters, options);
  }
}

module.exports = new ActivityLogService();
