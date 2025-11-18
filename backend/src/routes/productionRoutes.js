const express = require('express');
const router = express.Router();
const Production = require('../models/Production');
const { authenticateToken, requireManager } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/helpers');

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const batches = await Production.getAll(req.query);
    res.json(successResponse(batches, 'Production batches retrieved', 'تم استرجاع دفعات الإنتاج'));
  } catch (error) {
    next(error);
  }
});

router.get('/date/:date', authenticateToken, async (req, res, next) => {
  try {
    const batches = await Production.getByDate(req.params.date);
    res.json(successResponse(batches, 'Production batches retrieved', 'تم استرجاع دفعات الإنتاج'));
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateToken, requireManager, async (req, res, next) => {
  try {
    const batch = await Production.create({ ...req.body, created_by: req.user.id });
    res.status(201).json(successResponse(batch, 'Production batch created', 'تم إنشاء دفعة الإنتاج'));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateToken, requireManager, async (req, res, next) => {
  try {
    const batch = await Production.update(req.params.id, req.body);
    if (!batch) throw errorResponse('Production batch not found', 'دفعة الإنتاج غير موجودة', 404);
    res.json(successResponse(batch, 'Production batch updated', 'تم تحديث دفعة الإنتاج'));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
