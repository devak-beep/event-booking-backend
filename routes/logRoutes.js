const express = require('express');
const logController = require('../controllers/logController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/activity', authenticate, authorize('superadmin', 'admin'), logController.getActivityLogs.bind(logController));
router.get('/errors', authenticate, authorize('superadmin', 'admin'), logController.getErrorLogs.bind(logController));

module.exports = router;
