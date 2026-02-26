const complaintService = require('../services/complaintService');

class ComplaintController {
  async createComplaint(req, res, next) {
    try {
      const data = { ...req.body, userId: req.user._id };
      const complaint = await complaintService.createComplaint(data);
      res.status(201).json({ success: true, data: complaint });
    } catch (error) {
      next(error);
    }
  }

  async getAllComplaints(req, res, next) {
    try {
      const { status, priority } = req.query;
      const filters = {};
      if (status) filters.status = status;
      if (priority) filters.priority = priority;

      const complaints = await complaintService.getAllComplaints(filters);
      res.status(200).json({ success: true, data: complaints });
    } catch (error) {
      next(error);
    }
  }

  async getMyComplaints(req, res, next) {
    try {
      const complaints = await complaintService.getUserComplaints(req.user._id);
      res.status(200).json({ success: true, data: complaints });
    } catch (error) {
      next(error);
    }
  }

  async updateComplaint(req, res, next) {
    try {
      const complaint = await complaintService.updateComplaint(
        req.params.id,
        req.body,
        req.user._id,
        req.user.role
      );
      res.status(200).json({ success: true, data: complaint });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ComplaintController();
