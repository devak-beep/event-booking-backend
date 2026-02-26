const express = require('express');
const invoiceController = require('../controllers/invoiceController');
const { authenticate, authorize } = require('../middleware/auth');
const { logActivity } = require('../middleware/activityLogger');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' });

const router = express.Router();

router.post('/upload', authenticate, authorize('superadmin', 'admin'), upload.single('invoice'), logActivity('CREATE', 'Invoice'), invoiceController.uploadInvoice.bind(invoiceController));
router.get('/', authenticate, invoiceController.getInvoices.bind(invoiceController));
router.get('/:id', authenticate, invoiceController.getInvoiceById.bind(invoiceController));

module.exports = router;
