const ReportController = require('../controllers/reportController');
const BookingModel = require('../models/bookingModel');


jest.mock('../models/bookingModel');

describe('Report Generation', () => {
    let req, res;

    beforeEach(() => {
        // Reset mocks before each test
        jest.clearAllMocks();

        // Mock request object
        req = {
            query: {},
            user: {
                id: 'test-user-id'
            }
        };

        // Mock response object
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it('should generate a report successfully for a valid date range', async () => {
        // Arrange
        const startDate = '2024-01-01';
        const endDate = '2024-01-31';
        req.query = { startDate, endDate };

        const mockBookings = [
            { id: 1, amount_paid: 100 },
            { id: 2, amount_paid: 150 }
        ];

        // Mock the model to return successful data
        BookingModel.getBookingsInDateRange.mockResolvedValue({
            data: mockBookings,
            error: null
        });

        // Act
        await ReportController.generateReport(req, res);

        // Assert
        expect(BookingModel.getBookingsInDateRange).toHaveBeenCalledWith('test-user-id', startDate, endDate);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            totalBookings: 2,
            totalRevenue: 250,
            bookings: mockBookings
        }));
    });

    it('should return 400 if start date or end date is missing', async () => {
        // Arrange
        req.query = { startDate: '2024-01-01' }; // Missing endDate

        // Act
        await ReportController.generateReport(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
        expect(BookingModel.getBookingsInDateRange).not.toHaveBeenCalled();
    });

    it('should return an empty report if no bookings are found', async () => {
        // Arrange
        req.query = { startDate: '2024-02-01', endDate: '2024-02-28' };

        BookingModel.getBookingsInDateRange.mockResolvedValue({
            data: [],
            error: null
        });

        // Act
        await ReportController.generateReport(req, res);

        // Assert
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            totalBookings: 0,
            totalRevenue: 0,
            bookings: []
        }));
    });

    it('should handle database errors gracefully', async () => {
        // Arrange
        req.query = { startDate: '2024-01-01', endDate: '2024-01-31' };

        BookingModel.getBookingsInDateRange.mockResolvedValue({
            data: null,
            error: { message: 'Database connection failed' }
        });

        // Act
        await ReportController.generateReport(req, res);

        // Assert
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.any(String)
        }));
    });

    it('should validate that start date is not after end date', async () => {

        req.query = { startDate: '2024-02-01', endDate: '2024-01-01' };


        await ReportController.generateReport(req, res);


        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: expect.stringMatching(/invalid|after/i)
        }));
    });
});
