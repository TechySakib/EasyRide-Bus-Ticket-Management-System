const express = require('express');
const { requireAdmin } = require('../middleware/roleMiddleware');
const RouteController = require('../controllers/routeController');

const router = express.Router();

/**
 * POST /api/routes/create-from-location
 * Creates routes from a location name.
 * Protected by Admin Middleware.
 */
router.post('/create-from-location', requireAdmin, RouteController.createRouteFromLocation);

module.exports = router;
