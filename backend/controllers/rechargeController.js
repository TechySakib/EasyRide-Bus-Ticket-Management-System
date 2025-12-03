const rechargeModel = require('../models/rechargeModel');

const rechargeController = {
    // Submit a new recharge request
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

    // Get user's own recharge requests
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

    // Get all recharge requests (admin only)
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

    // Approve a recharge request (admin only)
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

    // Reject a recharge request (admin only)
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

    // Get wallet balance
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
