const errorLogRepository = require('../repositories/errorLogRepository');
const { v4: uuidv4 } = require('uuid');

class ErrorLogService {
  async log(error, req) {
    const correlationId = uuidv4();
    
    await errorLogRepository.create({
      correlationId,
      error: error.message,
      stack: error.stack,
      endpoint: req.originalUrl,
      method: req.method,
      userId: req.user?._id
    });

    return correlationId;
  }

  async getErrorLogs(filters, options) {
    return await errorLogRepository.findAll(filters, options);
  }
}

module.exports = new ErrorLogService();
