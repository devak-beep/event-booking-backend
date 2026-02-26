const express = require('express');
const masterDataController = require('../controllers/masterDataController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticate, masterDataController.getMasterData.bind(masterDataController));
router.get('/export', authenticate, authorize('superadmin', 'admin'), masterDataController.exportMasterData.bind(masterDataController));
router.post('/sync', authenticate, authorize('superadmin', 'admin'), masterDataController.syncFromAssets.bind(masterDataController));

module.exports = router;
