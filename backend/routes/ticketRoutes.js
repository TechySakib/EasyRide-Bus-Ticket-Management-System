/**
 * Ticket Routes
 * Defines API endpoints for ticket operations.
 * @module routes/ticketRoutes
 */

const express = require('express');
const router = express.Router();
const TicketController = require('../controllers/ticketController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes if appropriate, or selectively
// For now, assuming the frontend sends the token and we might want to verify it
// But looking at index.js, authMiddleware is used for /api/protected.
// I will use it here as well to ensure only authenticated users can access.

/**
 * Route to validate a ticket.
 * @name POST /api/tickets/validate
 * @function
 * @memberof module:routes/ticketRoutes
 * @inner
 */
router.post('/validate', TicketController.validateTicket);

/**
 * Route to get authenticated user's bookings.
 * @name GET /api/tickets/my-bookings
 * @function
 * @memberof module:routes/ticketRoutes
 * @inner
 */
router.get('/my-bookings', authMiddleware, TicketController.getUserBookings);

router.post('/', authMiddleware, TicketController.createTicket);
router.get('/user/:userId', authMiddleware, TicketController.getUserTickets);
router.get('/user/:userId/bookings', authMiddleware, TicketController.getUserBookings); // New endpoint for bookings
router.get('/admin/all', authMiddleware, TicketController.getAllTickets); // Admin: Get all tickets
router.patch('/:id/status', authMiddleware, TicketController.updateTicketStatus); // Admin: Update status
router.get('/:id', authMiddleware, TicketController.getTicketDetails);
router.post('/:id/comment', authMiddleware, TicketController.addTicketComment);

module.exports = router;
