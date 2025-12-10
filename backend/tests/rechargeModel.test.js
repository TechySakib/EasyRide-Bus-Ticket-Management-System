/**
 * Unit Tests for Recharge Model
 * Tests the subscription/recharge model functions with mocked Supabase
 */

// Mock Supabase before requiring the model
jest.mock('@supabase/supabase-js', () => ({
    createClient: jest.fn(() => mockSupabase)
}));

// Create chainable mock for Supabase queries
const mockSupabase = {
    from: jest.fn(() => mockSupabase),
    insert: jest.fn(() => mockSupabase),
    select: jest.fn(() => mockSupabase),
    update: jest.fn(() => mockSupabase),
    eq: jest.fn(() => mockSupabase),
    single: jest.fn(() => mockSupabase),
    order: jest.fn(() => mockSupabase),
    auth: {
        admin: {
            getUserById: jest.fn()
        }
    }
};

// Store original env
const originalEnv = process.env;

describe('Recharge Model', () => {
    let rechargeModel;

    beforeAll(() => {
        // Set mock environment variables
        process.env = {
            ...originalEnv,
            SUPABASE_URL: 'https://mock-supabase.co',
            SUPABASE_SERVICE_ROLE_KEY: 'mock-service-key'
        };
        // Require after mocking
        rechargeModel = require('../models/rechargeModel');
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset all mock implementations
        mockSupabase.from.mockReturnValue(mockSupabase);
        mockSupabase.insert.mockReturnValue(mockSupabase);
        mockSupabase.select.mockReturnValue(mockSupabase);
        mockSupabase.update.mockReturnValue(mockSupabase);
        mockSupabase.eq.mockReturnValue(mockSupabase);
        mockSupabase.order.mockReturnValue(mockSupabase);
    });

    describe('createRequest', () => {
        it('should create a recharge request successfully', async () => {
            const mockData = {
                id: 1,
                user_id: 'user-123',
                amount: 100,
                payment_method: 'bkash',
                phone_number: '01712345678',
                transaction_id: 'TXN123',
                status: 'pending'
            };

            mockSupabase.single.mockResolvedValue({ data: mockData, error: null });

            const result = await rechargeModel.createRequest(
                'user-123',
                100,
                'bkash',
                '01712345678',
                'TXN123'
            );

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockData);
            expect(mockSupabase.from).toHaveBeenCalledWith('easyride_recharge_requests');
        });

        it('should return error on database failure', async () => {
            mockSupabase.single.mockResolvedValue({
                data: null,
                error: { message: 'Database error' }
            });

            const result = await rechargeModel.createRequest(
                'user-123',
                100,
                'bkash',
                '01712345678',
                'TXN123'
            );

            expect(result.success).toBe(false);
            expect(result.error).toBe('Database error');
        });
    });

    describe('getRequestsByUser', () => {
        it('should return user requests successfully', async () => {
            const mockData = [
                { id: 1, amount: 100, status: 'pending' },
                { id: 2, amount: 200, status: 'approved' }
            ];

            mockSupabase.order.mockResolvedValue({ data: mockData, error: null });

            const result = await rechargeModel.getRequestsByUser('user-123');

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockData);
            expect(mockSupabase.eq).toHaveBeenCalledWith('user_id', 'user-123');
        });

        it('should return error on database failure', async () => {
            mockSupabase.order.mockResolvedValue({
                data: null,
                error: { message: 'Fetch error' }
            });

            const result = await rechargeModel.getRequestsByUser('user-123');

            expect(result.success).toBe(false);
        });
    });

    describe('getWalletBalance', () => {
        it('should return existing wallet balance', async () => {
            mockSupabase.single.mockResolvedValue({
                data: { balance: 500.00 },
                error: null
            });

            const result = await rechargeModel.getWalletBalance('user-123');

            expect(result.success).toBe(true);
            expect(result.balance).toBe(500.00);
        });

        it('should create wallet and return 0 balance if wallet does not exist', async () => {
            // First call - wallet not found
            mockSupabase.single.mockResolvedValueOnce({
                data: null,
                error: { code: 'PGRST116', message: 'Not found' }
            });
            // Second call - create wallet
            mockSupabase.single.mockResolvedValueOnce({
                data: { user_id: 'user-123', balance: 0 },
                error: null
            });

            const result = await rechargeModel.getWalletBalance('user-123');

            expect(result.success).toBe(true);
            expect(result.balance).toBe(0);
        });

        it('should return error on database failure', async () => {
            mockSupabase.single.mockResolvedValue({
                data: null,
                error: { code: 'OTHER', message: 'Database error' }
            });

            const result = await rechargeModel.getWalletBalance('user-123');

            expect(result.success).toBe(false);
        });
    });

    describe('approveRequest', () => {
        it('should return error if request already processed', async () => {
            // Mock getRequestById to return already processed request
            mockSupabase.single.mockResolvedValueOnce({
                data: { id: 1, status: 'approved', user_id: 'user-123' },
                error: null
            });
            mockSupabase.auth.admin.getUserById.mockResolvedValue({ data: { user: { email: 'test@test.com' } } });

            const result = await rechargeModel.approveRequest('1', 'admin-123');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Request has already been processed');
        });
    });

    describe('rejectRequest', () => {
        it('should return error if request already processed', async () => {
            // Mock getRequestById to return already processed request
            mockSupabase.single.mockResolvedValueOnce({
                data: { id: 1, status: 'rejected', user_id: 'user-123' },
                error: null
            });
            mockSupabase.auth.admin.getUserById.mockResolvedValue({ data: { user: { email: 'test@test.com' } } });

            const result = await rechargeModel.rejectRequest('1', 'admin-123', 'Invalid transaction');

            expect(result.success).toBe(false);
            expect(result.error).toBe('Request has already been processed');
        });
    });
});
