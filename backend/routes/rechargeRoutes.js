const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleMiddleware');
const rechargeController = require('../controllers/rechargeController');

// User routes (authenticated users)
router.post('/request', authMiddleware, rechargeController.submitRequest);
router.get('/my-requests', authMiddleware, rechargeController.getMyRequests);
router.get('/wallet/balance', authMiddleware, rechargeController.getWalletBalance);

// Admin routes (admin only)
router.get('/all', requireAdmin, rechargeController.getAllRequests);
router.post('/approve/:id', requireAdmin, rechargeController.approveRequest);
router.post('/reject/:id', requireAdmin, rechargeController.rejectRequest);

module.exports = router;
