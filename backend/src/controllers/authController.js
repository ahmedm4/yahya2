const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../middleware/auth');
const { successResponse, errorResponse } = require('../utils/helpers');

class AuthController {
  /**
   * Login
   */
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      // Get user by email
      const user = await User.getByEmail(email);

      if (!user) {
        throw errorResponse(
          'Invalid email or password',
          'البريد الإلكتروني أو كلمة المرور غير صحيحة',
          401
        );
      }

      if (!user.active) {
        throw errorResponse(
          'Account is disabled',
          'الحساب معطل',
          403
        );
      }

      // Verify password
      const isPasswordValid = await User.verifyPassword(password, user.password_hash);

      if (!isPasswordValid) {
        throw errorResponse(
          'Invalid email or password',
          'البريد الإلكتروني أو كلمة المرور غير صحيحة',
          401
        );
      }

      // Update last login
      await User.updateLastLogin(user.id);

      // Generate tokens
      const token = generateToken(user.id, user.role);
      const refreshToken = generateRefreshToken(user.id);

      // Remove sensitive data
      delete user.password_hash;

      res.json(successResponse(
        {
          user,
          token,
          refreshToken
        },
        'Login successful',
        'تم تسجيل الدخول بنجاح'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Register new user (Manager only)
   */
  static async register(req, res, next) {
    try {
      const { name, email, password, role, branch_id } = req.body;

      // Check if email already exists
      const existingUser = await User.getByEmail(email);
      if (existingUser) {
        throw errorResponse(
          'Email already exists',
          'البريد الإلكتروني مستخدم بالفعل',
          409
        );
      }

      // Create user
      const user = await User.create({
        name,
        email,
        password,
        role: role || 'user',
        branch_id
      });

      res.status(201).json(successResponse(
        user,
        'User registered successfully',
        'تم تسجيل المستخدم بنجاح'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req, res, next) {
    try {
      const user = await User.getById(req.user.id);

      if (!user) {
        throw errorResponse(
          'User not found',
          'المستخدم غير موجود',
          404
        );
      }

      res.json(successResponse(user, 'Profile retrieved', 'تم استرجاع الملف الشخصي'));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update current user profile
   */
  static async updateProfile(req, res, next) {
    try {
      const { name, email } = req.body;

      const user = await User.update(req.user.id, { name, email });

      if (!user) {
        throw errorResponse(
          'User not found',
          'المستخدم غير موجود',
          404
        );
      }

      res.json(successResponse(
        user,
        'Profile updated successfully',
        'تم تحديث الملف الشخصي بنجاح'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   */
  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;

      // Get user with password
      const user = await User.getByEmail(req.user.email);

      // Verify current password
      const isPasswordValid = await User.verifyPassword(currentPassword, user.password_hash);

      if (!isPasswordValid) {
        throw errorResponse(
          'Current password is incorrect',
          'كلمة المرور الحالية غير صحيحة',
          401
        );
      }

      // Update password
      await User.updatePassword(req.user.id, newPassword);

      res.json(successResponse(
        null,
        'Password changed successfully',
        'تم تغيير كلمة المرور بنجاح'
      ));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout (client-side token removal)
   */
  static async logout(req, res, next) {
    try {
      // In a real application, you might want to blacklist the token
      // For now, we'll just send a success response
      res.json(successResponse(
        null,
        'Logged out successfully',
        'تم تسجيل الخروج بنجاح'
      ));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
