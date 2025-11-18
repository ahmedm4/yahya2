const { query } = require('../config/database');
const Order = require('../models/Order');
const Transfer = require('../models/Transfer');
const Production = require('../models/Production');
const Inventory = require('../models/Inventory');
const { successResponse, errorResponse } = require('../utils/helpers');

class DashboardController {
  /**
   * Get main dashboard statistics
   */
  static async getStats(req, res, next) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const branchId = req.user.role === 'manager' ? null : req.user.branch_id;

      // Get today's orders summary
      const ordersSummary = await Order.getDailyProductionSummary(today);

      // Get pending transfers
      const pendingTransfers = await Transfer.getPending();

      // Get production batches for today
      const productionBatches = await Production.getByDate(today);

      // Get total statistics
      const statsQuery = `
        SELECT
          (SELECT COUNT(*) FROM branch_orders WHERE order_date = $1 ${branchId ? 'AND branch_id = $2' : ''}) as total_orders_today,
          (SELECT COUNT(*) FROM transfers WHERE status = 'pending' ${branchId ? 'AND (from_branch_id = $2 OR to_branch_id = $2)' : ''}) as pending_transfers,
          (SELECT SUM(batches_planned) FROM production_batches WHERE production_date = $1) as total_batches_planned,
          (SELECT COUNT(DISTINCT product_id) FROM branch_order_items boi
           JOIN branch_orders bo ON boi.branch_order_id = bo.id
           WHERE bo.order_date = $1 ${branchId ? 'AND bo.branch_id = $2' : ''}) as products_ordered
      `;

      const statsResult = await query(
        statsQuery,
        branchId ? [today, branchId] : [today]
      );

      const stats = statsResult.rows[0];

      res.json(successResponse(
        {
          date: today,
          stats: {
            total_orders_today: parseInt(stats.total_orders_today) || 0,
            pending_transfers: parseInt(stats.pending_transfers) || 0,
            total_batches_planned: parseInt(stats.total_batches_planned) || 0,
            products_ordered: parseInt(stats.products_ordered) || 0
          },
          production_summary: ordersSummary,
          pending_transfers: pendingTransfers.slice(0, 5),
          production_batches: productionBatches
        },
        'Dashboard data retrieved successfully',
        'تم استرجاع بيانات لوحة التحكم بنجاح'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get branch performance report
   */
  static async getBranchReport(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const branchId = req.user.role === 'manager'
        ? parseInt(req.params.branchId)
        : req.user.branch_id;

      const reportQuery = `
        SELECT
          b.name as branch_name,
          COUNT(DISTINCT bo.id) as total_orders,
          COALESCE(SUM(boi.pieces_requested), 0) as total_pieces_requested,
          COALESCE(SUM(boi.pieces_delivered), 0) as total_pieces_delivered,
          COALESCE(SUM(di.sold), 0) as total_sold,
          COALESCE(SUM(di.damaged), 0) as total_damaged,
          COUNT(DISTINCT t_out.id) as transfers_sent,
          COUNT(DISTINCT t_in.id) as transfers_received
        FROM branches b
        LEFT JOIN branch_orders bo ON b.id = bo.branch_id
          AND bo.order_date BETWEEN $2 AND $3
        LEFT JOIN branch_order_items boi ON bo.id = boi.branch_order_id
        LEFT JOIN daily_inventory di ON b.id = di.branch_id
          AND di.inventory_date BETWEEN $2 AND $3
        LEFT JOIN transfers t_out ON b.id = t_out.from_branch_id
          AND t_out.transfer_date BETWEEN $2 AND $3
        LEFT JOIN transfers t_in ON b.id = t_in.to_branch_id
          AND t_in.transfer_date BETWEEN $2 AND $3
        WHERE b.id = $1
        GROUP BY b.id, b.name
      `;

      const result = await query(reportQuery, [branchId, start_date, end_date]);

      if (result.rows.length === 0) {
        throw errorResponse('Branch not found', 'الفرع غير موجود', 404);
      }

      res.json(successResponse(
        {
          branch_id: branchId,
          period: { start_date, end_date },
          report: result.rows[0]
        },
        'Branch report retrieved successfully',
        'تم استرجاع تقرير الفرع بنجاح'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get production efficiency report
   */
  static async getProductionReport(req, res, next) {
    try {
      const { start_date, end_date } = req.query;

      const summary = await Production.getSummary(start_date, end_date);

      res.json(successResponse(
        {
          period: { start_date, end_date },
          summary
        },
        'Production report retrieved successfully',
        'تم استرجاع تقرير الإنتاج بنجاح'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get inventory alerts (low stock, high surplus)
   */
  static async getInventoryAlerts(req, res, next) {
    try {
      const today = new Date().toISOString().split('T')[0];

      // Get latest inventory with alerts
      const alertsQuery = `
        SELECT
          di.*,
          b.name as branch_name,
          p.name as product_name,
          CASE
            WHEN di.closing_stock < 10 THEN 'low_stock'
            WHEN di.closing_stock > 200 THEN 'high_stock'
            WHEN di.damaged > 20 THEN 'high_damage'
            ELSE 'normal'
          END as alert_type
        FROM daily_inventory di
        JOIN branches b ON di.branch_id = b.id
        JOIN products p ON di.product_id = p.id
        WHERE di.inventory_date = $1
          AND (di.closing_stock < 10 OR di.closing_stock > 200 OR di.damaged > 20)
        ORDER BY di.closing_stock ASC
      `;

      const result = await query(alertsQuery, [today]);

      res.json(successResponse(
        result.rows,
        'Inventory alerts retrieved successfully',
        'تم استرجاع تنبيهات المخزون بنجاح'
      ));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = DashboardController;
