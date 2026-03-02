const assignmentRepository = require('../repositories/assignmentRepository');
const assetRepository = require('../repositories/assetRepository');
const { AppError } = require('../middleware/errorHandler');
const Assignment = require('../models/Assignment');

class AssignmentService {
  async assignAsset(assetId, userId, notes) {
    const asset = await assetRepository.findById(assetId);
    if (!asset) {
      throw new AppError('Asset not found', 404);
    }

    if (asset.assetType === 'non-assignable') {
      throw new AppError('This asset type cannot be assigned to users', 400);
    }

    if (asset.status !== 'available') {
      throw new AppError(`Asset is not available. Current status: ${asset.status}`, 400);
    }

    // Double check for active assignment
    const activeAssignment = await assignmentRepository.findActiveByAsset(assetId);
    if (activeAssignment) {
      throw new AppError('Asset is already assigned to another user', 400);
    }

    const assignment = await assignmentRepository.create({ assetId, userId, notes });
    
    await assetRepository.update(assetId, { status: 'assigned', assignedTo: userId });

    return await assignmentRepository.findById(assignment._id);
  }

  async assignMultipleAssets(assetIds, userId, notes) {
    const assignments = [];
    
    for (const assetId of assetIds) {
      const assignment = await this.assignAsset(assetId, userId, notes);
      assignments.push(assignment);
    }

    return assignments;
  }

  async getAllAssignments(filters, options) {
    const { page = 1, limit = 10 } = options || {};
    const skip = (page - 1) * limit;
    const total = await Assignment.countDocuments(filters);
    const data = await Assignment.find(filters)
      .populate('assetId', 'assetId name brand model serialNumber category status')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    return { data, total, page, pages: Math.ceil(total / limit) };
  }

  async returnAsset(assignmentId) {
    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      throw new AppError('Assignment not found', 404);
    }

    if (assignment.status === 'returned') {
      throw new AppError('Asset already returned', 400);
    }

    await assignmentRepository.update(assignmentId, {
      status: 'returned',
      returnedDate: new Date()
    });

    await assetRepository.update(assignment.assetId._id, { status: 'available', assignedTo: null });

    return await assignmentRepository.findById(assignmentId);
  }

  async getAssetHistory(assetId, options) {
    return await assignmentRepository.findByAsset(assetId, options);
  }

  async getAssignmentByAsset(assetId) {
    const assignment = await assignmentRepository.findActiveByAsset(assetId);
    if (assignment) {
      await assignment.populate('userId', 'name email');
    }
    return assignment;
  }
}

module.exports = new AssignmentService();
