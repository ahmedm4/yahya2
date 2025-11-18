const Order = require('../models/Order');
const Production = require('../models/Production');
const { successResponse, errorResponse, calculateProductionSummary } = require('../utils/helpers');

class OrderController {
  /**
   * Get all orders
   */
  static async getAll(req, res, next) {
    try {
      const { branch_id, status, start_date, end_date, limit, offset } = req.query;

      // If user is not a manager, restrict to their branch
      const filters = {
        branch_id: req.user.role === 'manager' ? branch_id : req.user.branch_id,
        status,
        start_date,
        end_date,
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0
      };

      const orders = await Order.getAll(filters);

      res.json(successResponse(
        orders,
        'Orders retrieved successfully',
        'تم استرجاع الطلبات بنجاح'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order by ID
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const order = await Order.getById(id);

      if (!order) {
        throw errorResponse('Order not found', 'الطلب غير موجود', 404);
      }

      // Check access rights
      if (req.user.role !== 'manager' && order.branch_id !== req.user.branch_id) {
        throw errorResponse(
          'Access denied',
          'لا يمكنك الوصول إلى هذا الطلب',
          403
        );
      }

      res.json(successResponse(
        order,
        'Order retrieved successfully',
        'تم استرجاع الطلب بنجاح'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get today's order for a branch
   */
  static async getTodayOrder(req, res, next) {
    try {
      const branchId = req.user.role === 'manager'
        ? parseInt(req.params.branchId)
        : req.user.branch_id;

      const today = new Date().toISOString().split('T')[0];
      const order = await Order.getByBranchAndDate(branchId, today);

      res.json(successResponse(
        order || { message: 'No order for today' },
        'Order retrieved successfully',
        'تم استرجاع طلب اليوم'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new order
   */
  static async create(req, res, next) {
    try {
      const { branch_id, order_date, status, notes, items } = req.body;

      // Validate branch access
      const orderBranchId = branch_id || req.user.branch_id;
      if (req.user.role !== 'manager' && orderBranchId !== req.user.branch_id) {
        throw errorResponse(
          'Access denied',
          'لا يمكنك إنشاء طلب لفرع آخر',
          403
        );
      }

      // Check if order already exists for this date
      const existingOrder = await Order.getByBranchAndDate(orderBranchId, order_date);
      if (existingOrder) {
        throw errorResponse(
          'Order already exists for this date',
          'يوجد طلب بالفعل لهذا التاريخ',
          409
        );
      }

      // Create order
      const order = await Order.create(
        {
          branch_id: orderBranchId,
          order_date,
          status: status || 'draft',
          notes,
          submitted_by: req.user.id
        },
        items
      );

      // Get the complete order with items
      const completeOrder = await Order.getById(order.id);

      res.status(201).json(successResponse(
        completeOrder,
        'Order created successfully',
        'تم إنشاء الطلب بنجاح'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order status
   */
  static async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;

      const existingOrder = await Order.getById(id);
      if (!existingOrder) {
        throw errorResponse('Order not found', 'الطلب غير موجود', 404);
      }

      // Check access rights
      if (req.user.role !== 'manager' && existingOrder.branch_id !== req.user.branch_id) {
        throw errorResponse(
          'Access denied',
          'لا يمكنك تعديل هذا الطلب',
          403
        );
      }

      // Only managers can confirm orders
      if (status === 'confirmed' && req.user.role !== 'manager') {
        throw errorResponse(
          'Manager access required',
          'تأكيد الطلب يتطلب صلاحيات المدير',
          403
        );
      }

      const updatedOrder = await Order.update(id, {
        status,
        notes,
        confirmed_by: status === 'confirmed' ? req.user.id : null
      });

      res.json(successResponse(
        updatedOrder,
        'Order updated successfully',
        'تم تحديث الطلب بنجاح'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order item
   */
  static async updateItem(req, res, next) {
    try {
      const { itemId } = req.params;
      const { pieces_requested, pieces_delivered, notes } = req.body;

      const updatedItem = await Order.updateItem(itemId, {
        pieces_requested,
        pieces_delivered,
        notes
      });

      if (!updatedItem) {
        throw errorResponse('Order item not found', 'بند الطلب غير موجود', 404);
      }

      res.json(successResponse(
        updatedItem,
        'Order item updated successfully',
        'تم تحديث بند الطلب بنجاح'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get daily production summary (العجائن المطلوبة)
   * This is the core calculation feature
   */
  static async getProductionSummary(req, res, next) {
    try {
      const { date } = req.params;
      const orderDate = date || new Date().toISOString().split('T')[0];

      // Get summary from view
      const summary = await Order.getDailyProductionSummary(orderDate);

      // Calculate totals
      const totals = {
        total_products: summary.length,
        total_pieces_requested: summary.reduce((sum, item) => sum + parseInt(item.total_pieces_requested), 0),
        total_batches_needed: summary.reduce((sum, item) => sum + parseInt(item.batches_needed), 0),
        total_pieces_to_produce: summary.reduce((sum, item) => sum + parseInt(item.pieces_to_produce), 0),
        total_surplus: summary.reduce((sum, item) => sum + parseInt(item.surplus), 0)
      };

      res.json(successResponse(
        {
          date: orderDate,
          summary,
          totals
        },
        'Production summary retrieved successfully',
        'تم استرجاع ملخص الإنتاج بنجاح'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create production plan from orders
   */
  static async createProductionPlan(req, res, next) {
    try {
      const { date } = req.body;
      const productionDate = date || new Date().toISOString().split('T')[0];

      // Only managers can create production plans
      if (req.user.role !== 'manager') {
        throw errorResponse(
          'Manager access required',
          'إنشاء خطة الإنتاج يتطلب صلاحيات المدير',
          403
        );
      }

      // Calculate production plan
      const productionPlan = await Production.calculateProductionPlan(productionDate);

      if (productionPlan.length === 0) {
        throw errorResponse(
          'No orders found for this date',
          'لا توجد طلبات لهذا التاريخ',
          404
        );
      }

      // Create production batches
      const createdBatches = [];
      for (const plan of productionPlan) {
        const batch = await Production.create({
          product_id: plan.product_id,
          meal_id: plan.meal_id,
          production_date: productionDate,
          batches_planned: plan.batches_needed,
          pieces_planned: plan.pieces_to_produce,
          created_by: req.user.id
        });
        createdBatches.push(batch);
      }

      res.status(201).json(successResponse(
        {
          production_date: productionDate,
          batches: createdBatches,
          summary: productionPlan
        },
        'Production plan created successfully',
        'تم إنشاء خطة الإنتاج بنجاح'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete order
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const existingOrder = await Order.getById(id);
      if (!existingOrder) {
        throw errorResponse('Order not found', 'الطلب غير موجود', 404);
      }

      // Check access rights
      if (req.user.role !== 'manager' && existingOrder.branch_id !== req.user.branch_id) {
        throw errorResponse(
          'Access denied',
          'لا يمكنك حذف هذا الطلب',
          403
        );
      }

      // Only allow deleting draft orders
      if (existingOrder.status !== 'draft') {
        throw errorResponse(
          'Can only delete draft orders',
          'يمكن حذف الطلبات في حالة المسودة فقط',
          400
        );
      }

      await Order.delete(id);

      res.json(successResponse(
        null,
        'Order deleted successfully',
        'تم حذف الطلب بنجاح'
      ));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = OrderController;
