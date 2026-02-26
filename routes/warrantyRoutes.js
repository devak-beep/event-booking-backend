const express = require('express');
const warrantyController = require('../controllers/warrantyController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticate, authorize('superadmin', 'admin', 'manager'), warrantyController.createWarranty.bind(warrantyController));
router.put('/:id', authenticate, authorize('superadmin', 'admin', 'manager'), warrantyController.updateWarranty.bind(warrantyController));
router.get('/', authenticate, warrantyController.getAllWarranties.bind(warrantyController));
router.get('/expiring', authenticate, warrantyController.getExpiringWarranties.bind(warrantyController));

module.exports = router;
