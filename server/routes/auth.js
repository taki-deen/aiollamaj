const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, changePassword, getAllUsers, updateUserByAdmin, deleteUserByAdmin } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfile);
router.put('/change-password', authenticate, changePassword);

// Admin routes
router.get('/admin/users', authenticate, getAllUsers);
router.put('/admin/users/:userId', authenticate, updateUserByAdmin);
router.delete('/admin/users/:userId', authenticate, deleteUserByAdmin);

module.exports = router;
