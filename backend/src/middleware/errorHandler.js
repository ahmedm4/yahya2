// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Default error status and message
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let message_ar = err.message_ar || 'خطأ داخلي في الخادم';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    message_ar = 'خطأ في التحقق من البيانات';
  }

  if (err.code === '23505') { // PostgreSQL unique violation
    statusCode = 409;
    message = 'Duplicate entry';
    message_ar = 'القيمة مكررة';
  }

  if (err.code === '23503') { // PostgreSQL foreign key violation
    statusCode = 400;
    message = 'Referenced record does not exist';
    message_ar = 'السجل المرجعي غير موجود';
  }

  if (err.code === '23502') { // PostgreSQL not null violation
    statusCode = 400;
    message = 'Required field missing';
    message_ar = 'حقل مطلوب مفقود';
  }

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    message_ar,
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack
    })
  });
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    message_ar: 'المسار غير موجود',
    path: req.originalUrl
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
