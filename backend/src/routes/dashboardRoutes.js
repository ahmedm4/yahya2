const express = require('express');
const router = express.Router();
const DashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// All dashboard routes require authentication
router.get('/stats', authenticateToken, DashboardController.getStats);
router.get('/branch-report/:branchId?', authenticateToken, DashboardController.getBranchReport);
router.get('/production-report', authenticateToken, DashboardController.getProductionReport);
router.get('/inventory-alerts', authenticateToken, DashboardController.getInventoryAlerts);

module.exports = router;
