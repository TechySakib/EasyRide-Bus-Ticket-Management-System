/**
 * Ticket Routes
 * Defines API endpoints for ticket operations.
 * @module routes/ticketRoutes
 */

const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middleware/auth'); // Assuming you want to protect this

/**
 * Route to validate a ticket.
 * @name POST /api/tickets/validate
 * @function
 * @memberof module:routes/ticketRoutes
 * @inner
 */
router.post('/validate', ticketController.validateTicket);

module.exports = router;
