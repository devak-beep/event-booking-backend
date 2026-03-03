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
    
    const complaintUserId = complaint.userId?._id ? complaint.userId._id.toString() : complaint.userId.toString();
    const requestUserId = userId.toString();
    const normalizedRole = userRole.toLowerCase();
    
    console.log('Update Complaint Debug:', {
      complaintUserId,
      requestUserId,
      userRole,
      normalizedRole,
      match: complaintUserId === requestUserId
    });
    
    if (normalizedRole === 'user' && complaintUserId !== requestUserId) {
      throw new AppError('Access denied', 403);
    }

    // Prevent reopening completed complaints
    if (complaint.status === 'completed') {
      throw new AppError('Cannot modify completed complaint', 400);
    }

    // Users can only edit title, description, and priority when status is 'new'
    if (normalizedRole === 'user') {
      if (complaint.status !== 'new') {
        throw new AppError('Can only edit complaints with new status', 400);
      }
      // Users cannot change status
      delete data.status;
    }

    // Validate status transitions (only for admins)
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
