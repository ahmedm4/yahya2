/**
 * Utility helper functions for the bakery management system
 */

/**
 * Calculate number of batches needed based on total pieces requested
 * @param {number} totalPieces - Total pieces requested
 * @param {number} piecesPerBatch - Number of pieces per batch
 * @returns {number} Number of batches needed (rounded up)
 */
const calculateBatchesNeeded = (totalPieces, piecesPerBatch) => {
  if (piecesPerBatch <= 0) {
    throw new Error('Pieces per batch must be greater than 0');
  }
  return Math.ceil(totalPieces / piecesPerBatch);
};

/**
 * Calculate total pieces to produce based on batches
 * @param {number} batches - Number of batches
 * @param {number} piecesPerBatch - Pieces per batch
 * @returns {number} Total pieces to produce
 */
const calculatePiecesToProduce = (batches, piecesPerBatch) => {
  return batches * piecesPerBatch;
};

/**
 * Calculate surplus pieces
 * @param {number} piecesToProduce - Total pieces to produce
 * @param {number} piecesRequested - Total pieces requested
 * @returns {number} Surplus pieces
 */
const calculateSurplus = (piecesToProduce, piecesRequested) => {
  return piecesToProduce - piecesRequested;
};

/**
 * Generate transfer number
 * Format: TR-YYYYMMDD-XXX
 * @param {number} sequenceNumber - Sequence number for the day
 * @returns {string} Transfer number
 */
const generateTransferNumber = (sequenceNumber = 1) => {
  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const seq = String(sequenceNumber).padStart(3, '0');
  return `TR-${dateStr}-${seq}`;
};

/**
 * Format date to YYYY-MM-DD
 * @param {Date} date - Date object
 * @returns {string} Formatted date string
 */
const formatDate = (date = new Date()) => {
  return date.toISOString().split('T')[0];
};

/**
 * Check if order cutoff time has passed
 * @param {number} cutoffHour - Cutoff hour (24-hour format)
 * @returns {boolean} True if cutoff has passed
 */
const hasPassedCutoff = (cutoffHour = 14) => {
  const now = new Date();
  return now.getHours() >= cutoffHour;
};

/**
 * Calculate production summary for a product
 * @param {Array} orders - Array of order items
 * @param {number} piecesPerBatch - Pieces per batch for the product
 * @returns {Object} Production summary
 */
const calculateProductionSummary = (orders, piecesPerBatch) => {
  const totalRequested = orders.reduce((sum, order) => sum + order.pieces_requested, 0);
  const batchesNeeded = calculateBatchesNeeded(totalRequested, piecesPerBatch);
  const piecesToProduce = calculatePiecesToProduce(batchesNeeded, piecesPerBatch);
  const surplus = calculateSurplus(piecesToProduce, totalRequested);

  return {
    totalRequested,
    batchesNeeded,
    piecesToProduce,
    surplus,
    efficiency: ((totalRequested / piecesToProduce) * 100).toFixed(2) + '%'
  };
};

/**
 * Paginate results
 * @param {number} page - Current page number
 * @param {number} limit - Items per page
 * @returns {Object} Pagination object with offset and limit
 */
const paginate = (page = 1, limit = 20) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
  const offset = (pageNum - 1) * limitNum;

  return {
    limit: limitNum,
    offset,
    page: pageNum
  };
};

/**
 * Create pagination metadata
 * @param {number} totalItems - Total number of items
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @returns {Object} Pagination metadata
 */
const createPaginationMeta = (totalItems, page, limit) => {
  const totalPages = Math.ceil(totalItems / limit);
  return {
    currentPage: page,
    totalPages,
    totalItems,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1
  };
};

/**
 * Sanitize object by removing undefined/null values
 * @param {Object} obj - Object to sanitize
 * @returns {Object} Sanitized object
 */
const sanitizeObject = (obj) => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null) {
      acc[key] = value;
    }
    return acc;
  }, {});
};

/**
 * Create success response
 * @param {*} data - Response data
 * @param {string} message - Success message
 * @param {string} message_ar - Arabic success message
 * @returns {Object} Success response object
 */
const successResponse = (data, message = 'Success', message_ar = 'نجحت العملية') => {
  return {
    success: true,
    message,
    message_ar,
    data
  };
};

/**
 * Create error response
 * @param {string} message - Error message
 * @param {string} message_ar - Arabic error message
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Error object
 */
const errorResponse = (message, message_ar, statusCode = 500) => {
  const error = new Error(message);
  error.message_ar = message_ar;
  error.statusCode = statusCode;
  return error;
};

module.exports = {
  calculateBatchesNeeded,
  calculatePiecesToProduce,
  calculateSurplus,
  calculateProductionSummary,
  generateTransferNumber,
  formatDate,
  hasPassedCutoff,
  paginate,
  createPaginationMeta,
  sanitizeObject,
  successResponse,
  errorResponse,
};
