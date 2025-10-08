const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');
const { aiChatLimiter } = require('../middleware/rateLimiter');

// AI Chat - مع Rate Limiting (Admin only)
router.post('/chat', authenticate, aiChatLimiter, chatWithAI);

module.exports = router;

