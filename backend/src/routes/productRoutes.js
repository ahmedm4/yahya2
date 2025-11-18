const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const { authenticateToken, requireManager } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/helpers');

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const products = await Product.getAll(req.query.active === 'true');
    res.json(successResponse(products, 'Products retrieved', 'تم استرجاع المنتجات'));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const product = await Product.getById(req.params.id);
    if (!product) throw errorResponse('Product not found', 'المنتج غير موجود', 404);
    res.json(successResponse(product, 'Product retrieved', 'تم استرجاع المنتج'));
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateToken, requireManager, async (req, res, next) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(successResponse(product, 'Product created', 'تم إنشاء المنتج'));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateToken, requireManager, async (req, res, next) => {
  try {
    const product = await Product.update(req.params.id, req.body);
    if (!product) throw errorResponse('Product not found', 'المنتج غير موجود', 404);
    res.json(successResponse(product, 'Product updated', 'تم تحديث المنتج'));
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateToken, requireManager, async (req, res, next) => {
  try {
    const product = await Product.delete(req.params.id);
    if (!product) throw errorResponse('Product not found', 'المنتج غير موجود', 404);
    res.json(successResponse(null, 'Product deleted', 'تم حذف المنتج'));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
