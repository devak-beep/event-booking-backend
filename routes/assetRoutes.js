const express = require('express');
const multer = require('multer');
const path = require('path');
const assetController = require('../controllers/assetController');
const { authenticate, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');

const router = express.Router();

// Configure multer for invoice uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/invoices/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'invoice-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed'));
    }
  }
});

router.post('/', authenticate, authorize('superadmin', 'admin', 'manager', 'hr'), logActivity('CREATE', 'Asset'), assetController.createAsset.bind(assetController));
router.post('/bulk', upload.single('invoiceImage'), authenticate, authorize('superadmin', 'admin', 'manager', 'hr'), logActivity('CREATE', 'Asset'), assetController.createBulkAssets.bind(assetController));
router.post('/multiple', authenticate, authorize('superadmin', 'admin', 'manager', 'hr'), logActivity('CREATE', 'Asset'), assetController.createMultipleAssets.bind(assetController));
router.post('/bulk-from-invoice', authenticate, authorize('superadmin', 'admin'), logActivity('CREATE', 'Asset'), assetController.createAssetsFromInvoice.bind(assetController));
router.get('/', authenticate, assetController.getAssets.bind(assetController));
router.get('/master-data', authenticate, assetController.getMasterData.bind(assetController));
router.get('/:id', authenticate, assetController.getAssetById.bind(assetController));
router.put('/:id', authenticate, authorize('superadmin', 'admin', 'manager'), logActivity('UPDATE', 'Asset'), assetController.updateAsset.bind(assetController));
router.delete('/:id', authenticate, authorize('superadmin', 'admin'), logActivity('DELETE', 'Asset'), assetController.deleteAsset.bind(assetController));

module.exports = router;
