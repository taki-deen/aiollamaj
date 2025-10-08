const express = require('express');
const router = express.Router();
const { 
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
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authLimiter, adminLimiter } = require('../middleware/rateLimiter');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer storage for avatars
const avatarsDir = path.join(__dirname, '..', 'uploads', 'avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, avatarsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${req.user?._id || 'guest'}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  cb(new Error('Only image files are allowed'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Public routes - مع Rate Limiting للمصادقة
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Email verification routes
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', authenticate, resendVerification);

// Password reset routes
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPassword);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);
router.post('/profile/avatar', authenticate, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    const relativePath = `uploads/avatars/${path.basename(req.file.path)}`;
    const user = await require('../models/User').findByIdAndUpdate(
      req.user._id,
      { avatarUrl: `/${relativePath}` },
      { new: true }
    ).select('-password');
    res.json({ success: true, message: 'Avatar updated', data: { user } });
  } catch (err) {
    console.error('Avatar upload error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload avatar' });
  }
});

// Admin routes - مع Rate Limiting للعمليات الإدارية
router.get('/admin/users', authenticate, adminLimiter, getAllUsers);
router.post('/admin/users', authenticate, adminLimiter, createUserByAdmin);
router.put('/admin/users/:userId', authenticate, adminLimiter, updateUserByAdmin);
router.delete('/admin/users/:userId', authenticate, adminLimiter, deleteUserByAdmin);

module.exports = router;
