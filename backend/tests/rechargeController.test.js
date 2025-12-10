/**
 * Unit Tests for Recharge Controller
 * Tests the subscription/recharge functionality without hitting real database
 */

const rechargeController = require('../controllers/rechargeController');

// Mock the rechargeModel
jest.mock('../models/rechargeModel', () => ({
    createRequest: jest.fn(),
    getRequestsByUser: jest.fn(),
    getAllRequests: jest.fn(),
    approveRequest: jest.fn(),
    rejectRequest: jest.fn(),
    getWalletBalance: jest.fn()
}));

const rechargeModel = require('../models/rechargeModel');

// Mock request and response objects
const mockRequest = (body = {}, params = {}, query = {}, user = { id: 'test-user-id' }) => ({
    body,
    params,
    query,
    user
});

const mockResponse = () => {
    const res = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Recharge Controller', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('submitRequest', () => {
        it('should return 400 if required fields are missing', async () => {
            const req = mockRequest({ amount: 100 }); // Missing other fields
            const res = mockResponse();

            await rechargeController.submitRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: 'All fields are required'
            });
        });

        it('should return 400 if amount is invalid', async () => {
            const req = mockRequest({
                amount: -50,
                paymentMethod: 'bkash',
                phoneNumber: '01712345678',
                transactionId: 'TXN123'
            });
            const res = mockResponse();

            await rechargeController.submitRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: 'Invalid amount'
            });
        });

        it('should return 400 if payment method is invalid', async () => {
            const req = mockRequest({
                amount: 100,
                paymentMethod: 'paypal', // Invalid method
                phoneNumber: '01712345678',
                transactionId: 'TXN123'
            });
            const res = mockResponse();

            await rechargeController.submitRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: 'Invalid payment method'
            });
        });

        it('should return 400 if phone number format is invalid', async () => {
            const req = mockRequest({
                amount: 100,
                paymentMethod: 'bkash',
                phoneNumber: '123', // Invalid format
                transactionId: 'TXN123'
            });
            const res = mockResponse();

            await rechargeController.submitRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: 'Invalid phone number format'
            });
        });

        it('should create request successfully with valid data', async () => {
            const req = mockRequest({
                amount: 100,
                paymentMethod: 'bkash',
                phoneNumber: '01712345678',
                transactionId: 'TXN123'
            });
            const res = mockResponse();

            rechargeModel.createRequest.mockResolvedValue({
                success: true,
                data: { id: 1, amount: 100 }
            });

            await rechargeController.submitRequest(req, res);

            expect(rechargeModel.createRequest).toHaveBeenCalledWith(
                'test-user-id',
                100,
                'bkash',
                '01712345678',
                'TXN123'
            );
            expect(res.status).toHaveBeenCalledWith(201);
        });

        it('should return 409 if transaction ID is duplicate', async () => {
            const req = mockRequest({
                amount: 100,
                paymentMethod: 'bkash',
                phoneNumber: '01712345678',
                transactionId: 'TXN123'
            });
            const res = mockResponse();

            rechargeModel.createRequest.mockResolvedValue({
                success: false,
                error: 'duplicate key value violates unique constraint'
            });

            await rechargeController.submitRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(409);
        });
    });

    describe('getMyRequests', () => {
        it('should return user requests successfully', async () => {
            const req = mockRequest();
            const res = mockResponse();

            const mockData = [
                { id: 1, amount: 100, status: 'pending' },
                { id: 2, amount: 200, status: 'approved' }
            ];

            rechargeModel.getRequestsByUser.mockResolvedValue({
                success: true,
                data: mockData
            });

            await rechargeController.getMyRequests(req, res);

            expect(rechargeModel.getRequestsByUser).toHaveBeenCalledWith('test-user-id');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                data: mockData
            });
        });

        it('should return 500 on error', async () => {
            const req = mockRequest();
            const res = mockResponse();

            rechargeModel.getRequestsByUser.mockResolvedValue({
                success: false,
                error: 'Database error'
            });

            await rechargeController.getMyRequests(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('getWalletBalance', () => {
        it('should return wallet balance successfully', async () => {
            const req = mockRequest();
            const res = mockResponse();

            rechargeModel.getWalletBalance.mockResolvedValue({
                success: true,
                balance: 500.00
            });

            await rechargeController.getWalletBalance(req, res);

            expect(rechargeModel.getWalletBalance).toHaveBeenCalledWith('test-user-id');
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                balance: 500.00
            });
        });

        it('should return 500 on error', async () => {
            const req = mockRequest();
            const res = mockResponse();

            rechargeModel.getWalletBalance.mockResolvedValue({
                success: false,
                error: 'Database error'
            });

            await rechargeController.getWalletBalance(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
        });
    });

    describe('approveRequest', () => {
        it('should approve request successfully', async () => {
            const req = mockRequest({}, { id: '123' });
            const res = mockResponse();

            rechargeModel.approveRequest.mockResolvedValue({
                success: true,
                message: 'Recharge request approved successfully'
            });

            await rechargeController.approveRequest(req, res);

            expect(rechargeModel.approveRequest).toHaveBeenCalledWith('123', 'test-user-id');
            expect(res.status).toHaveBeenCalledWith(200);
        });

        it('should return 400 if approval fails', async () => {
            const req = mockRequest({}, { id: '123' });
            const res = mockResponse();

            rechargeModel.approveRequest.mockResolvedValue({
                success: false,
                error: 'Request has already been processed'
            });

            await rechargeController.approveRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('rejectRequest', () => {
        it('should return 400 if rejection reason is missing', async () => {
            const req = mockRequest({ reason: '' }, { id: '123' });
            const res = mockResponse();

            await rechargeController.rejectRequest(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                error: 'Rejection reason is required'
            });
        });

        it('should reject request successfully with reason', async () => {
            const req = mockRequest({ reason: 'Invalid transaction' }, { id: '123' });
            const res = mockResponse();

            rechargeModel.rejectRequest.mockResolvedValue({
                success: true,
                message: 'Recharge request rejected successfully'
            });

            await rechargeController.rejectRequest(req, res);

            expect(rechargeModel.rejectRequest).toHaveBeenCalledWith('123', 'test-user-id', 'Invalid transaction');
            expect(res.status).toHaveBeenCalledWith(200);
        });
    });
});
