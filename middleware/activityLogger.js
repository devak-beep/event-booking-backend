const activityLogService = require('../services/activityLogService');

const logActivity = (action, entity) => {
  return async (req, res, next) => {
    const originalSend = res.send;
    
    res.send = function(data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const entityId = req.params.id || JSON.parse(data)?.data?._id;
        activityLogService.log(
          req.user._id,
          action,
          entity,
          entityId,
          req.body
        ).catch(err => console.error('Activity log error:', err.message));
      }
      originalSend.call(this, data);
    };
    
    next();
  };
};

module.exports = { logActivity };
