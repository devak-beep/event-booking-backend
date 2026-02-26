const express = require('express');
const complaintController = require('../controllers/complaintController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, complaintController.createComplaint.bind(complaintController));
router.get('/', authenticate, authorize('superadmin', 'admin', 'manager', 'hr'), complaintController.getAllComplaints.bind(complaintController));
router.get('/my', authenticate, complaintController.getMyComplaints.bind(complaintController));
router.patch('/:id', authenticate, complaintController.updateComplaint.bind(complaintController));

module.exports = router;
