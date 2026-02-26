const express = require('express');
const maintenanceController = require('../controllers/maintenanceController');
const { authenticate, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

const router = express.Router();

router.post('/', authenticate, authorize('superadmin', 'admin', 'manager'), logActivity('CREATE', 'Maintenance'), maintenanceController.createMaintenance.bind(maintenanceController));
router.get('/', authenticate, maintenanceController.getAllMaintenance.bind(maintenanceController));
router.put('/:id', authenticate, authorize('superadmin', 'admin', 'manager'), logActivity('UPDATE', 'Maintenance'), maintenanceController.updateMaintenance.bind(maintenanceController));
router.post('/:id/complete', authenticate, authorize('superadmin', 'admin', 'manager'), logActivity('COMPLETE', 'Maintenance'), maintenanceController.completeMaintenance.bind(maintenanceController));

module.exports = router;
