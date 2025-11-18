const express = require('express');
const router = express.Router();
const Branch = require('../models/Branch');
const { authenticateToken, requireManager } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/helpers');

// Get all branches
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const activeOnly = req.query.active === 'true';
    const branches = await Branch.getAll(activeOnly);
    res.json(successResponse(branches, 'Branches retrieved', 'تم استرجاع الفروع'));
  } catch (error) {
    next(error);
  }
});

// Get branch by ID
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const branch = await Branch.getById(req.params.id);
    if (!branch) throw errorResponse('Branch not found', 'الفرع غير موجود', 404);
    res.json(successResponse(branch, 'Branch retrieved', 'تم استرجاع الفرع'));
  } catch (error) {
    next(error);
  }
});

// Create branch (Manager only)
router.post('/', authenticateToken, requireManager, async (req, res, next) => {
  try {
    const branch = await Branch.create(req.body);
    res.status(201).json(successResponse(branch, 'Branch created', 'تم إنشاء الفرع'));
  } catch (error) {
    next(error);
  }
});

// Update branch (Manager only)
router.put('/:id', authenticateToken, requireManager, async (req, res, next) => {
  try {
    const branch = await Branch.update(req.params.id, req.body);
    if (!branch) throw errorResponse('Branch not found', 'الفرع غير موجود', 404);
    res.json(successResponse(branch, 'Branch updated', 'تم تحديث الفرع'));
  } catch (error) {
    next(error);
  }
});

// Delete branch (Manager only)
router.delete('/:id', authenticateToken, requireManager, async (req, res, next) => {
  try {
    const branch = await Branch.delete(req.params.id);
    if (!branch) throw errorResponse('Branch not found', 'الفرع غير موجود', 404);
    res.json(successResponse(null, 'Branch deleted', 'تم حذف الفرع'));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
