const complaintRepository = require('../repositories/complaintRepository');
const { AppError } = require('../middleware/errorHandler');

class ComplaintService {
  async createComplaint(data) {
    return await complaintRepository.create(data);
  }

  async getAllComplaints(filters) {
    return await complaintRepository.findAll(filters);
  }

  async getComplaintById(id) {
    const complaint = await complaintRepository.findById(id);
    if (!complaint) throw new AppError('Complaint not found', 404);
    return complaint;
  }

  async getUserComplaints(userId) {
    return await complaintRepository.findByUser(userId);
  }

  async updateComplaint(id, data, userId, userRole) {
    const complaint = await this.getComplaintById(id);
    
    if (userRole === 'user' && complaint.userId.toString() !== userId) {
      throw new AppError('Access denied', 403);
    }

    if (data.status === 'resolved' || data.status === 'closed') {
      data.resolvedBy = userId;
      data.resolvedAt = new Date();
    }

    return await complaintRepository.update(id, data);
  }
}

module.exports = new ComplaintService();
