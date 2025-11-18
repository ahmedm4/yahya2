const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AuthController = require('../controllers/authController');
const { authenticateToken, requireManager } = require('../middleware/auth');
const validate = require('../middleware/validator');

// Validation rules
const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['manager', 'user']).withMessage('Invalid role'),
  body('branch_id').optional().isInt().withMessage('Branch ID must be a number'),
  validate
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  validate
];

// Public routes
router.post('/login', loginValidation, AuthController.login);

// Protected routes (require authentication)
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, AuthController.updateProfile);
router.post('/change-password', authenticateToken, changePasswordValidation, AuthController.changePassword);
router.post('/logout', authenticateToken, AuthController.logout);

// Manager only routes
router.post('/register', authenticateToken, requireManager, registerValidation, AuthController.register);

module.exports = router;
