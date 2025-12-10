const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const authMiddleware = require('../middleware/auth');

/**
 * POST /api/chat
 * Handles chat interactions with the AI agent.
 * Protected by Auth Middleware.
 */
router.post('/chat', authMiddleware, chatController.chatWithAgent);

module.exports = router;
