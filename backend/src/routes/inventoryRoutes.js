const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');
const { authenticateToken } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/helpers');

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const inventory = await Inventory.getAll(req.query);
    res.json(successResponse(inventory, 'Inventory retrieved', 'تم استرجاع المخزون'));
  } catch (error) {
    next(error);
  }
});

router.get('/current/:branchId', authenticateToken, async (req, res, next) => {
  try {
    const inventory = await Inventory.getCurrentByBranch(req.params.branchId);
    res.json(successResponse(inventory, 'Current inventory retrieved', 'تم استرجاع المخزون الحالي'));
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const inventory = await Inventory.upsert({ ...req.body, recorded_by: req.user.id });
    res.status(201).json(successResponse(inventory, 'Inventory recorded', 'تم تسجيل المخزون'));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateToken, async (req, res, next) => {
  try {
    const inventory = await Inventory.update(req.params.id, req.body);
    if (!inventory) throw errorResponse('Inventory not found', 'المخزون غير موجود', 404);
    res.json(successResponse(inventory, 'Inventory updated', 'تم تحديث المخزون'));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
