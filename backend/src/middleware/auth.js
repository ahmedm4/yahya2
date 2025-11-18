const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        message_ar: 'رمز الدخول مطلوب'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const result = await query(
      'SELECT id, name, email, role, branch_id, active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        message_ar: 'المستخدم غير موجود'
      });
    }

    const user = result.rows[0];

    if (!user.active) {
      return res.status(403).json({
        success: false,
        message: 'User account is disabled',
        message_ar: 'حساب المستخدم معطل'
      });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Invalid token',
        message_ar: 'رمز دخول غير صالح'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Token expired',
        message_ar: 'انتهت صلاحية رمز الدخول'
      });
    }
    console.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
      message_ar: 'فشلت عملية المصادقة'
    });
  }
};

// Middleware to check if user is a manager
const requireManager = (req, res, next) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({
      success: false,
      message: 'Manager access required',
      message_ar: 'هذه العملية تتطلب صلاحيات المدير'
    });
  }
  next();
};

// Middleware to check if user belongs to a specific branch or is a manager
const requireBranchAccess = (branchIdParam = 'branchId') => {
  return (req, res, next) => {
    const requestedBranchId = parseInt(req.params[branchIdParam] || req.body.branch_id);

    // Managers can access all branches
    if (req.user.role === 'manager') {
      return next();
    }

    // Users can only access their own branch
    if (req.user.branch_id !== requestedBranchId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this branch',
        message_ar: 'لا يمكنك الوصول إلى هذا الفرع'
      });
    }

    next();
  };
};

// Generate JWT token
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );
};

module.exports = {
  authenticateToken,
  requireManager,
  requireBranchAccess,
  generateToken,
  generateRefreshToken,
};
