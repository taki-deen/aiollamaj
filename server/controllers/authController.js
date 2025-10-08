const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { sendSuccess, sendError } = require('../utils/responseHelper');
const { checkUserExists, createUser } = require('../utils/userHelper');
const { 
  sendVerificationEmail, 
  sendPasswordResetEmail, 
  generateToken: generateEmailToken 
} = require('../services/emailService');
const path = require('path');
const fs = require('fs');

// Register new user
const register = async (req, res) => {
  try {
    const { username, email, password, firstName, lastName } = req.body;
    
    const user = await createUser({ username, email, password, firstName, lastName });
    
    // توليد token للتحقق من البريد
    const verificationToken = generateEmailToken();
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 ساعة
    await user.save();
    
    // إرسال إيميل التحقق
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    await sendVerificationEmail(user, verificationUrl);
    
    const token = generateToken(user._id);

    sendSuccess(res, { 
      user: user.toJSON(), 
      token,
      message: 'تم إرسال رابط التأكيد إلى بريدك الإلكتروني'
    }, 'User registered successfully', 201);
  } catch (error) {
    console.error('Registration error:', error);
    sendError(res, error.message || 'Registration failed', 
      error.message?.includes('already') ? 400 : 500, error);
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: user.toJSON(),
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: error.message
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, username } = req.body;
    const userId = req.user._id;

    // Check if username is taken by another user
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken'
        });
      }
    }

    // Update user
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (username) updateData.username = username;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    // Get user with password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: { users }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get users',
      error: error.message
    });
  }
};

// Update user by admin
const updateUserByAdmin = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { userId } = req.params;
    const { firstName, lastName, username, email, role, isActive } = req.body;

    // Check if email is taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already taken by another user'
        });
      }
    }

    // Check if username is taken by another user
    if (username) {
      const existingUser = await User.findOne({ 
        username, 
        _id: { $ne: userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken by another user'
        });
      }
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (typeof isActive === 'boolean') updateData.isActive = isActive;

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Update user by admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message
    });
  }
};

// Delete user by admin
const deleteUserByAdmin = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { userId } = req.params;

    // Prevent admin from deleting themselves
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    const user = await User.findByIdAndDelete(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user by admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message
    });
  }
};

const createUserByAdmin = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return sendError(res, 'Admin access required', 403);
    }

    const { username, email, password, firstName, lastName, role } = req.body;

    if (!username || !email || !password || !firstName || !lastName) {
      return sendError(res, 'All fields are required', 400);
    }

    const user = await createUser({ username, email, password, firstName, lastName, role });
    sendSuccess(res, { user: user.toJSON() }, 'User created successfully', 201);
  } catch (error) {
    console.error('Create user by admin error:', error);
    sendError(res, error.message || 'Failed to create user',
      error.message?.includes('already') ? 400 : 500, error);
  }
};

// تأكيد البريد الإلكتروني
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return sendError(res, 'رابط التحقق غير صالح أو منتهي الصلاحية', 400);
    }
    
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    sendSuccess(res, { user: user.toJSON() }, 'تم تأكيد البريد الإلكتروني بنجاح');
    
  } catch (error) {
    console.error('Email verification error:', error);
    sendError(res, 'Email verification failed', 500, error);
  }
};

// إعادة إرسال إيميل التحقق
const resendVerification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (user.isEmailVerified) {
      return sendError(res, 'البريد الإلكتروني مؤكد بالفعل', 400);
    }
    
    const verificationToken = generateEmailToken();
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await user.save();
    
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    await sendVerificationEmail(user, verificationUrl);
    
    sendSuccess(res, null, 'تم إرسال رابط التأكيد مجدداً');
    
  } catch (error) {
    console.error('Resend verification error:', error);
    sendError(res, 'Failed to resend verification', 500, error);
  }
};

// طلب إعادة تعيين كلمة المرور
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return sendError(res, 'البريد الإلكتروني مطلوب', 400);
    }
    
    const user = await User.findOne({ email });
    
    if (!user) {
      // لا نُخبر المستخدم إن كان البريد موجود أم لا (أمان)
      return sendSuccess(res, null, 'إن كان البريد موجود، سيتم إرسال رابط إعادة التعيين');
    }
    
    const resetToken = generateEmailToken();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // ساعة واحدة
    await user.save();
    
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendPasswordResetEmail(user, resetUrl);
    
    sendSuccess(res, null, 'تم إرسال رابط إعادة تعيين كلمة المرور');
    
  } catch (error) {
    console.error('Forgot password error:', error);
    sendError(res, 'Failed to process request', 500, error);
  }
};

// إعادة تعيين كلمة المرور
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    if (!password || password.length < 6) {
      return sendError(res, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل', 400);
    }
    
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return sendError(res, 'رابط إعادة التعيين غير صالح أو منتهي الصلاحية', 400);
    }
    
    user.password = password; // سيتم تشفيرها تلقائياً
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    
    sendSuccess(res, null, 'تم تغيير كلمة المرور بنجاح');
    
  } catch (error) {
    console.error('Reset password error:', error);
    sendError(res, 'Password reset failed', 500, error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserByAdmin,
  deleteUserByAdmin,
  createUserByAdmin,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword
};
