const express = require('express');
const vendorController = require('../controllers/vendorController');
const { authenticate, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

const router = express.Router();

router.post('/', authenticate, authorize('superadmin', 'admin'), logActivity('CREATE', 'Vendor'), vendorController.createVendor.bind(vendorController));
router.get('/', authenticate, vendorController.getVendors.bind(vendorController));
router.get('/:id', authenticate, vendorController.getVendorById.bind(vendorController));
router.put('/:id', authenticate, authorize('superadmin', 'admin'), logActivity('UPDATE', 'Vendor'), vendorController.updateVendor.bind(vendorController));
router.delete('/:id', authenticate, authorize('superadmin', 'admin'), logActivity('DELETE', 'Vendor'), vendorController.deleteVendor.bind(vendorController));

module.exports = router;
