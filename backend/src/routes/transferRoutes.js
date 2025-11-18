const express = require('express');
const router = express.Router();
const Transfer = require('../models/Transfer');
const { authenticateToken, requireManager } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/helpers');

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const transfers = await Transfer.getAll(req.query);
    res.json(successResponse(transfers, 'Transfers retrieved', 'تم استرجاع التحويلات'));
  } catch (error) {
    next(error);
  }
});

router.get('/pending', authenticateToken, async (req, res, next) => {
  try {
    const transfers = await Transfer.getPending();
    res.json(successResponse(transfers, 'Pending transfers retrieved', 'تم استرجاع التحويلات المعلقة'));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const transfer = await Transfer.getById(req.params.id);
    if (!transfer) throw errorResponse('Transfer not found', 'التحويل غير موجود', 404);
    res.json(successResponse(transfer, 'Transfer retrieved', 'تم استرجاع التحويل'));
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const transfer = await Transfer.create({ ...req.body, requested_by: req.user.id });
    res.status(201).json(successResponse(transfer, 'Transfer created', 'تم إنشاء التحويل'));
  } catch (error) {
    next(error);
  }
});

router.put('/:id/approve', authenticateToken, requireManager, async (req, res, next) => {
  try {
    const transfer = await Transfer.approve(req.params.id, req.user.id);
    if (!transfer) throw errorResponse('Transfer not found', 'التحويل غير موجود', 404);
    res.json(successResponse(transfer, 'Transfer approved', 'تم الموافقة على التحويل'));
  } catch (error) {
    next(error);
  }
});

router.put('/:id/reject', authenticateToken, requireManager, async (req, res, next) => {
  try {
    const transfer = await Transfer.reject(req.params.id, req.user.id);
    if (!transfer) throw errorResponse('Transfer not found', 'التحويل غير موجود', 404);
    res.json(successResponse(transfer, 'Transfer rejected', 'تم رفض التحويل'));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
