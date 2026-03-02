const complaintRepository = require('../repositories/complaintRepository');
const Asset = require('../models/Asset');
const { AppError } = require('../middleware/errorHandler');

class ComplaintService {
  async createComplaint(data) {
    const complaint = await complaintRepository.create(data);
    
    // Update asset status to damage
    await Asset.findByIdAndUpdate(data.assetId, { status: 'damage' });
    
    return complaint;
  }

  async getAllComplaints(filters, options) {
    return await complaintRepository.findAll(filters, options);
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

    // Prevent reopening completed complaints
    if (complaint.status === 'completed') {
      throw new AppError('Cannot modify completed complaint', 400);
    }

    // Validate status transitions
    const validTransitions = {
      'new': ['acknowledged'],
      'acknowledged': ['in-progress'],
      'in-progress': ['completed']
    };

    if (data.status && data.status !== complaint.status) {
      const allowed = validTransitions[complaint.status];
      if (!allowed || !allowed.includes(data.status)) {
        throw new AppError(`Cannot transition from ${complaint.status} to ${data.status}`, 400);
      }
    }

    if (data.status === 'completed') {
      data.resolvedBy = userId;
      data.resolvedAt = new Date();
      
      // Restore asset status to available
      await Asset.findByIdAndUpdate(complaint.assetId, { status: 'available' });
    }

    return await complaintRepository.update(id, data);
  }
}

module.exports = new ComplaintService();
