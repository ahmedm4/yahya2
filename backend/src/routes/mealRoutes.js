const express = require('express');
const router = express.Router();
const Meal = require('../models/Meal');
const { authenticateToken, requireManager } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/helpers');

router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const meals = await Meal.getAll(req.query.active === 'true');
    res.json(successResponse(meals, 'Meals retrieved', 'تم استرجاع العجائن'));
  } catch (error) {
    next(error);
  }
});

router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const meal = await Meal.getById(req.params.id);
    if (!meal) throw errorResponse('Meal not found', 'العجنة غير موجودة', 404);
    res.json(successResponse(meal, 'Meal retrieved', 'تم استرجاع العجنة'));
  } catch (error) {
    next(error);
  }
});

router.post('/', authenticateToken, requireManager, async (req, res, next) => {
  try {
    const meal = await Meal.create(req.body);
    res.status(201).json(successResponse(meal, 'Meal created', 'تم إنشاء العجنة'));
  } catch (error) {
    next(error);
  }
});

router.put('/:id', authenticateToken, requireManager, async (req, res, next) => {
  try {
    const meal = await Meal.update(req.params.id, req.body);
    if (!meal) throw errorResponse('Meal not found', 'العجنة غير موجودة', 404);
    res.json(successResponse(meal, 'Meal updated', 'تم تحديث العجنة'));
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', authenticateToken, requireManager, async (req, res, next) => {
  try {
    const meal = await Meal.delete(req.params.id);
    if (!meal) throw errorResponse('Meal not found', 'العجنة غير موجودة', 404);
    res.json(successResponse(null, 'Meal deleted', 'تم حذف العجنة'));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
