const express = require('express');
const alertController = require('../controllers/alertController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, alertController.getAllAlerts.bind(alertController));
router.patch('/:id', authenticate, authorize('superadmin', 'admin', 'manager'), alertController.updateAlert.bind(alertController));

module.exports = router;
