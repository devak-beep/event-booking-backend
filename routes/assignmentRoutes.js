const express = require('express');
const assignmentController = require('../controllers/assignmentController');
const { authenticate, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

const router = express.Router();

router.post('/assign', authenticate, authorize('superadmin', 'admin', 'manager'), logActivity('ASSIGN', 'Asset'), assignmentController.assignAsset.bind(assignmentController));
router.post('/assign-multiple', authenticate, authorize('superadmin', 'admin', 'manager'), logActivity('ASSIGN', 'Asset'), assignmentController.assignMultipleAssets.bind(assignmentController));
router.post('/return', authenticate, authorize('superadmin', 'admin', 'manager'), logActivity('RETURN', 'Asset'), assignmentController.returnAsset.bind(assignmentController));
router.get('/', authenticate, assignmentController.getAllAssignments.bind(assignmentController));
router.get('/history/:assetId', authenticate, authorize('superadmin', 'admin', 'hr'), assignmentController.getAssetHistory.bind(assignmentController));

module.exports = router;
