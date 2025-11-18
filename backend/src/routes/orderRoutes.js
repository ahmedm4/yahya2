const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const OrderController = require('../controllers/orderController');
const { authenticateToken, requireManager } = require('../middleware/auth');
const validate = require('../middleware/validator');

// Validation rules
const createOrderValidation = [
  body('branch_id').optional().isInt().withMessage('Branch ID must be a number'),
  body('order_date').isDate().withMessage('Valid order date is required'),
  body('items').isArray({ min: 1 }).withMessage('Order must have at least one item'),
  body('items.*.product_id').isInt().withMessage('Product ID must be a number'),
  body('items.*.pieces_requested').isInt({ min: 0 }).withMessage('Pieces requested must be a positive number'),
  validate
];

const updateStatusValidation = [
  body('status').isIn(['draft', 'submitted', 'confirmed', 'completed', 'cancelled']).withMessage('Invalid status'),
  validate
];

// Routes
router.get('/', authenticateToken, OrderController.getAll);
router.get('/today/:branchId?', authenticateToken, OrderController.getTodayOrder);
router.get('/production-summary/:date?', authenticateToken, OrderController.getProductionSummary);
router.get('/:id', authenticateToken, OrderController.getById);

router.post('/', authenticateToken, createOrderValidation, OrderController.create);
router.post('/production-plan', authenticateToken, requireManager, OrderController.createProductionPlan);

router.put('/:id/status', authenticateToken, updateStatusValidation, OrderController.updateStatus);
router.put('/items/:itemId', authenticateToken, OrderController.updateItem);

router.delete('/:id', authenticateToken, OrderController.delete);

module.exports = router;
