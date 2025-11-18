const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { authenticateToken, requireManager } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/helpers');

// Get all users (Manager only)
router.get('/', authenticateToken, requireManager, async (req, res, next) => {
  try {
    const users = await User.getAll();
    res.json(successResponse(users, 'Users retrieved', 'تم استرجاع المستخدمين'));
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const user = await User.getById(req.params.id);
    if (!user) throw errorResponse('User not found', 'المستخدم غير موجود', 404);
    res.json(successResponse(user, 'User retrieved', 'تم استرجاع المستخدم'));
  } catch (error) {
    next(error);
  }
});

// Update user (Manager only)
router.put('/:id', authenticateToken, requireManager, async (req, res, next) => {
  try {
    const user = await User.update(req.params.id, req.body);
    if (!user) throw errorResponse('User not found', 'المستخدم غير موجود', 404);
    res.json(successResponse(user, 'User updated', 'تم تحديث المستخدم'));
  } catch (error) {
    next(error);
  }
});

// Delete user (Manager only)
router.delete('/:id', authenticateToken, requireManager, async (req, res, next) => {
  try {
    const user = await User.delete(req.params.id);
    if (!user) throw errorResponse('User not found', 'المستخدم غير موجود', 404);
    res.json(successResponse(null, 'User deleted', 'تم حذف المستخدم'));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
