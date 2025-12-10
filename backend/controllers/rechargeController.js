/**
 * @fileoverview Recharge Controller - Handles wallet recharge and subscription payment operations
 * @module controllers/rechargeController
 * @description This controller manages all recharge-related HTTP endpoints including
 * submitting recharge requests, fetching user requests, admin approval/rejection,
 * and wallet balance queries.
 */

const rechargeModel = require('../models/rechargeModel');

/**
 * Recharge Controller Object
 * @namespace rechargeController
 * @description Controller containing all recharge/subscription payment handlers
 */
const rechargeController = {
    /**
     * Submit a new recharge request
     * @async
     * @function submitRequest
     * @memberof rechargeController
     * @param {Object} req - Express request object
     * @param {Object} req.body - Request body
     * @param {number} req.body.amount - Recharge amount (must be > 0)
     * @param {string} req.body.paymentMethod - Payment method ('bkash', 'nagad', 'rocket')
     * @param {string} req.body.phoneNumber - 11-digit phone number used for payment
     * @param {string} req.body.transactionId - Unique transaction ID from payment provider
     * @param {Object} req.user - Authenticated user object
     * @param {string} req.user.id - User's unique identifier
     * @param {Object} res - Express response object
     * @returns {Promise<void>} JSON response with success status and data or error
     * @example
     * // Request body
     * {
     *   "amount": 100,
     *   "paymentMethod": "bkash",
     *   "phoneNumber": "01712345678",
     *   "transactionId": "TXN123456"
     * }
     */
    async submitRequest(req, res) {
        try {
            const { amount, paymentMethod, phoneNumber, transactionId } = req.body;
            const userId = req.user.id;

            // Validation
            if (!amount || !paymentMethod || !phoneNumber || !transactionId) {
                return res.status(400).json({
                    success: false,
                    error: 'All fields are required'
                });
            }

            // Validate amount
            const parsedAmount = parseFloat(amount);
            if (isNaN(parsedAmount) || parsedAmount <= 0) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid amount'
                });
            }

            // Validate payment method
            const validMethods = ['bkash', 'nagad', 'rocket'];
            if (!validMethods.includes(paymentMethod.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid payment method'
                });
            }

            // Validate phone number (basic validation)
            const phoneRegex = /^[0-9]{11}$/;
            if (!phoneRegex.test(phoneNumber.replace(/[\s-]/g, ''))) {
                return res.status(400).json({
                    success: false,
                    error: 'Invalid phone number format'
                });
            }

            const result = await rechargeModel.createRequest(
                userId,
                parsedAmount,
                paymentMethod,
                phoneNumber,
                transactionId
            );

            if (result.success) {
                return res.status(201).json(result);
            } else {
                // Check if it's a duplicate transaction ID error
                if (result.error.includes('duplicate') || result.error.includes('unique')) {
                    return res.status(409).json({
                        success: false,
                        error: 'This transaction ID has already been used'
                    });
                }
                return res.status(500).json(result);
            }
        } catch (error) {
            console.error('Error in submitRequest:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * Get authenticated user's own recharge requests
     * @async
     * @function getMyRequests
     * @memberof rechargeController
     * @param {Object} req - Express request object
     * @param {Object} req.user - Authenticated user object
     * @param {string} req.user.id - User's unique identifier
     * @param {Object} res - Express response object
     * @returns {Promise<void>} JSON response with array of user's recharge requests
     */
    async getMyRequests(req, res) {
        try {
            const userId = req.user.id;

            const result = await rechargeModel.getRequestsByUser(userId);

            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(500).json(result);
            }
        } catch (error) {
            console.error('Error in getMyRequests:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * Get all recharge requests (Admin only)
     * @async
     * @function getAllRequests
     * @memberof rechargeController
     * @param {Object} req - Express request object
     * @param {Object} req.query - Query parameters
     * @param {string} [req.query.status] - Optional filter by status ('pending', 'approved', 'rejected')
     * @param {Object} res - Express response object
     * @returns {Promise<void>} JSON response with array of all recharge requests with user details
     */
    async getAllRequests(req, res) {
        try {
            const { status } = req.query;

            const result = await rechargeModel.getAllRequests(status);

            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(500).json(result);
            }
        } catch (error) {
            console.error('Error in getAllRequests:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * Approve a pending recharge request (Admin only)
     * @async
     * @function approveRequest
     * @memberof rechargeController
     * @param {Object} req - Express request object
     * @param {Object} req.params - URL parameters
     * @param {string} req.params.id - Recharge request ID to approve
     * @param {Object} req.user - Authenticated admin user object
     * @param {string} req.user.id - Admin's unique identifier
     * @param {Object} res - Express response object
     * @returns {Promise<void>} JSON response with success message or error
     */
    async approveRequest(req, res) {
        try {
            const { id } = req.params;
            const adminId = req.user.id;

            const result = await rechargeModel.approveRequest(id, adminId);

            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error in approveRequest:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * Reject a pending recharge request (Admin only)
     * @async
     * @function rejectRequest
     * @memberof rechargeController
     * @param {Object} req - Express request object
     * @param {Object} req.params - URL parameters
     * @param {string} req.params.id - Recharge request ID to reject
     * @param {Object} req.body - Request body
     * @param {string} req.body.reason - Required reason for rejection
     * @param {Object} req.user - Authenticated admin user object
     * @param {string} req.user.id - Admin's unique identifier
     * @param {Object} res - Express response object
     * @returns {Promise<void>} JSON response with success message or error
     */
    async rejectRequest(req, res) {
        try {
            const { id } = req.params;
            const { reason } = req.body;
            const adminId = req.user.id;

            if (!reason || reason.trim() === '') {
                return res.status(400).json({
                    success: false,
                    error: 'Rejection reason is required'
                });
            }

            const result = await rechargeModel.rejectRequest(id, adminId, reason);

            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error in rejectRequest:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    },

    /**
     * Get authenticated user's wallet balance
     * @async
     * @function getWalletBalance
     * @memberof rechargeController
     * @param {Object} req - Express request object
     * @param {Object} req.user - Authenticated user object
     * @param {string} req.user.id - User's unique identifier
     * @param {Object} res - Express response object
     * @returns {Promise<void>} JSON response with wallet balance
     * @example
     * // Response
     * { "success": true, "balance": 500.00 }
     */
    async getWalletBalance(req, res) {
        try {
            const userId = req.user.id;

            const result = await rechargeModel.getWalletBalance(userId);

            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(500).json(result);
            }
        } catch (error) {
            console.error('Error in getWalletBalance:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    }
};

module.exports = rechargeController;
