const express = require('express');
const router = express.Router();

// Import route modules
const authRoutes = require('./authRoutes');
const branchRoutes = require('./branchRoutes');
const userRoutes = require('./userRoutes');
const mealRoutes = require('./mealRoutes');
const productRoutes = require('./productRoutes');
const orderRoutes = require('./orderRoutes');
const inventoryRoutes = require('./inventoryRoutes');
const transferRoutes = require('./transferRoutes');
const productionRoutes = require('./productionRoutes');
const dashboardRoutes = require('./dashboardRoutes');

// API version
const API_VERSION = '/api/v1';

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Bakery Management API is running',
    message_ar: 'نظام إدارة المخابز يعمل بنجاح',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount routes
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/branches`, branchRoutes);
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/meals`, mealRoutes);
router.use(`${API_VERSION}/products`, productRoutes);
router.use(`${API_VERSION}/orders`, orderRoutes);
router.use(`${API_VERSION}/inventory`, inventoryRoutes);
router.use(`${API_VERSION}/transfers`, transferRoutes);
router.use(`${API_VERSION}/production`, productionRoutes);
router.use(`${API_VERSION}/dashboard`, dashboardRoutes);

module.exports = router;
