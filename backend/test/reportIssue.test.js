const TicketController = require('../controllers/ticketController');
const TicketModel = require('../models/ticketModel');
const { createClient } = require('@supabase/supabase-js');

// Mock TicketModel
jest.mock('../models/ticketModel');

// Mock Supabase Client
jest.mock('@supabase/supabase-js', () => {
    const mockSupabase = {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
        insert: jest.fn().mockReturnThis()
    };
    return {
        createClient: jest.fn(() => mockSupabase)
    };
});

describe('TicketController.createTicket', () => {
    let req, res, mockSupabase;

    beforeEach(() => {
        req = {
            body: {
                issue_title: 'Bus Breakdown',
                issue_description: 'Engine failure',
                category: 'technical',
                priority: 'high'
            },
            user: {
                email: 'test@example.com',
                user_metadata: { full_name: 'Test User' }
            }
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };

        // Get the mock instance
        mockSupabase = createClient();
        jest.clearAllMocks();
    });

    test('should return 401 if user email is missing', async () => {
        req.user = {}; // No email

        await TicketController.createTicket(req, res);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'User email not found in token' });
    });

    test('should create ticket successfully', async () => {
        // Mock getOrCreateUser Supabase calls
        // 1. Check if user exists -> return user ID
        mockSupabase.single.mockResolvedValueOnce({ data: { id: 123 }, error: null });

        // Mock TicketModel.createTicket
        const mockTicket = { id: 1, ticket_number: 'TKT-123', status: 'open' };
        TicketModel.createTicket.mockResolvedValue(mockTicket);

        // Mock TicketModel.addActivity
        TicketModel.addActivity.mockResolvedValue({});

        await TicketController.createTicket(req, res);

        // Verify user lookup
        expect(mockSupabase.from).toHaveBeenCalledWith('easyride_users');
        expect(mockSupabase.eq).toHaveBeenCalledWith('email', 'test@example.com');

        // Verify ticket creation
        expect(TicketModel.createTicket).toHaveBeenCalledWith(expect.objectContaining({
            user_id: 123,
            issue_title: 'Bus Breakdown',
            category: 'technical',
            priority: 'high'
        }));

        // Verify activity log
        expect(TicketModel.addActivity).toHaveBeenCalledWith(expect.objectContaining({
            ticket_id: 1,
            activity_type: 'created',
            performed_by: 123
        }));

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Ticket created successfully',
            ticket: mockTicket
        });
    });

    test('should create new user if not found, then create ticket', async () => {
        // Mock getOrCreateUser Supabase calls
        // 1. Check if user exists -> null (not found)
        mockSupabase.single.mockResolvedValueOnce({ data: null, error: null });

        // 2. Insert new user -> return new ID
        mockSupabase.single.mockResolvedValueOnce({ data: { id: 456 }, error: null });

        // Mock TicketModel
        const mockTicket = { id: 2, ticket_number: 'TKT-456', status: 'open' };
        TicketModel.createTicket.mockResolvedValue(mockTicket);
        TicketModel.addActivity.mockResolvedValue({});

        await TicketController.createTicket(req, res);

        // Verify user creation flow
        expect(mockSupabase.insert).toHaveBeenCalledWith(expect.arrayContaining([
            expect.objectContaining({ email: 'test@example.com' })
        ]));

        // Verify ticket creation with new user ID
        expect(TicketModel.createTicket).toHaveBeenCalledWith(expect.objectContaining({
            user_id: 456
        }));

        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('should return 500 if TicketModel fails', async () => {
        // Mock user lookup success
        mockSupabase.single.mockResolvedValueOnce({ data: { id: 123 }, error: null });

        // Mock TicketModel failure
        TicketModel.createTicket.mockRejectedValue(new Error('DB Error'));

        // Suppress console.error
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        await TicketController.createTicket(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: 'Failed to create ticket'
        }));

        consoleSpy.mockRestore();
    });
});
