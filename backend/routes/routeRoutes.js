const express = require('express');
const { requireAdmin } = require('../middleware/roleMiddleware');
const RouteController = require('../controllers/routeController');

const router = express.Router();

// Create routes from a location name (Admin only)
router.post('/create-from-location', requireAdmin, RouteController.createRouteFromLocation);

module.exports = router;
