const express = require('express');
const router = express.Router();
const { chatWithAI } = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');

router.post('/chat', authenticate, chatWithAI);

module.exports = router;

