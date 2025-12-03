const RouteController = require('../controllers/routeController');
const RouteModel = require('../models/routeModel');

// Mock the RouteModel to prevent DB interactions
jest.mock('../models/routeModel');

describe('RouteController.createRouteFromLocation', () => {
    let req, res;

    beforeEach(() => {
        req = {
            body: {}
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    test('should return 400 if locationName is missing', async () => {
        req.body = {}; // No locationName

        await RouteController.createRouteFromLocation(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.json).toHaveBeenCalledWith({ error: 'Location name is required' });
    });

    test('should create routes successfully when they do not exist', async () => {
        req.body = { locationName: 'Dhanmondi' };

        // Mock createLocation responses
        const mockLocation = { id: 1, name: 'Dhanmondi' };
        const mockCampus = { id: 2, name: 'North South University' };
        RouteModel.createLocation
            .mockResolvedValueOnce(mockLocation) // First call for location
            .mockResolvedValueOnce(mockCampus);  // Second call for campus

        // Mock findRoute to return null (routes don't exist)
        RouteModel.findRoute.mockResolvedValue(null);

        // Mock createRoute to return created routes
        const mockRouteTo = { id: 101, name: 'North South University to Dhanmondi' };
        const mockRouteFrom = { id: 102, name: 'Dhanmondi to North South University' };
        RouteModel.createRoute
            .mockResolvedValueOnce(mockRouteTo)
            .mockResolvedValueOnce(mockRouteFrom);

        await RouteController.createRouteFromLocation(req, res);

        // Verify locations were ensured
        expect(RouteModel.createLocation).toHaveBeenCalledWith('Dhanmondi');
        expect(RouteModel.createLocation).toHaveBeenCalledWith('North South University');

        // Verify routes were checked
        expect(RouteModel.findRoute).toHaveBeenCalledTimes(2);

        // Verify routes were created
        expect(RouteModel.createRoute).toHaveBeenCalledTimes(2);
        expect(RouteModel.createRoute).toHaveBeenCalledWith(expect.objectContaining({
            origin_id: mockCampus.id,
            destination_id: mockLocation.id
        }));
        expect(RouteModel.createRoute).toHaveBeenCalledWith(expect.objectContaining({
            origin_id: mockLocation.id,
            destination_id: mockCampus.id
        }));

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Routes created successfully',
            location: mockLocation,
            routes: [mockRouteTo, mockRouteFrom]
        });
    });

    test('should not create routes if they already exist', async () => {
        req.body = { locationName: 'Banani' };

        const mockLocation = { id: 3, name: 'Banani' };
        const mockCampus = { id: 2, name: 'North South University' };

        RouteModel.createLocation
            .mockResolvedValueOnce(mockLocation)
            .mockResolvedValueOnce(mockCampus);

        // Mock findRoute to return existing routes
        const existingRouteTo = { id: 201, name: 'NSU to Banani' };
        const existingRouteFrom = { id: 202, name: 'Banani to NSU' };

        RouteModel.findRoute
            .mockResolvedValueOnce(existingRouteTo)
            .mockResolvedValueOnce(existingRouteFrom);

        await RouteController.createRouteFromLocation(req, res);

        expect(RouteModel.createRoute).not.toHaveBeenCalled(); // Should NOT create new routes

        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith({
            message: 'Routes created successfully',
            location: mockLocation,
            routes: [existingRouteTo, existingRouteFrom]
        });
    });

    test('should return 500 if Model throws an error', async () => {
        req.body = { locationName: 'ErrorCity' };

        RouteModel.createLocation.mockRejectedValue(new Error('DB Error'));

        // Mock console.error to suppress output during test
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        await RouteController.createRouteFromLocation(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
            error: 'Failed to create route'
        }));

        consoleSpy.mockRestore();
    });
});
