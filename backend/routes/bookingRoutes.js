const express = require('express');
const router = express.Router();
const BookingController = require('../controllers/bookingController');
const authMiddleware = require('../middleware/auth');

// Protect all booking routes
router.use(authMiddleware);

router.get('/history/:userId', BookingController.getBookingHistory);

module.exports = router;
