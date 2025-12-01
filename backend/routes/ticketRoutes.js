const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const authMiddleware = require('../middleware/auth'); // Assuming you want to protect this

// POST /api/tickets/validate
router.post('/validate', ticketController.validateTicket);

module.exports = router;
