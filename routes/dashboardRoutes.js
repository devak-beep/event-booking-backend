const express = require('express');
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', authenticate, dashboardController.getSummary.bind(dashboardController));
router.get('/analytics', authenticate, dashboardController.getAnalytics.bind(dashboardController));

module.exports = router;
