const express = require('express');
const router = express.Router();
const RouteController = require('../controllers/routeController');
const authMiddleware = require('../middleware/auth');
const { requireRole, ROLES } = require('../middleware/roleMiddleware');

// Only admins can create routes
router.post('/create', authMiddleware, requireRole([ROLES.ADMIN]), RouteController.createRoute);

module.exports = router;
