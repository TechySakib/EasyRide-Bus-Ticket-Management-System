const RouteModel = require('../models/routeModel');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');

/**
 * Route Controller
 * Handles route creation and management logic.
 */
const RouteController = {
    /**
     * Creates routes between a specified location and the campus.
     * Ensures locations exist and creates bidirectional routes if they don't exist.
     * 
     * @param {Object} req - Express request object
     * @param {Object} req.body - Request body
     * @param {string} req.body.locationName - Name of the location to connect with campus
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response with created routes or error
     */
    createRouteFromLocation: async (req, res) => {
        try {
            const { locationName } = req.body;
            const campusName = "North South University"; // Hardcoded for now as per requirement

            if (!locationName) {
                return res.status(400).json({ error: 'Location name is required' });
            }

            // 1. Ensure locations exist and get their IDs
            const location = await RouteModel.createLocation(locationName);
            const campus = await RouteModel.createLocation(campusName);

            // 2. Create Route: Campus -> Location
            let routeToLocation = await RouteModel.findRoute(campus.id, location.id);
            if (!routeToLocation) {
                routeToLocation = await RouteModel.createRoute({
                    name: `${campusName} to ${locationName}`,
                    origin_id: campus.id,
                    destination_id: location.id,
                    distance_km: 10, // Default or placeholder
                    estimated_time_minutes: 60, // Default or placeholder
                    route_status: 'active'
                });
            }

            // 3. Create Route: Location -> Campus
            let routeFromLocation = await RouteModel.findRoute(location.id, campus.id);
            if (!routeFromLocation) {
                routeFromLocation = await RouteModel.createRoute({
                    name: `${locationName} to ${campusName}`,
                    origin_id: location.id,
                    destination_id: campus.id,
                    distance_km: 10, // Default
                    estimated_time_minutes: 60, // Default
                    route_status: 'active'
                });
            }

            res.status(201).json({
                message: 'Routes created successfully',
                location,
                routes: [routeToLocation, routeFromLocation]
            });

        } catch (error) {
            // Log to file
            try {
                const errorLog = `[${new Date().toISOString()}] Error: ${error.message}\nStack: ${error.stack}\n\n`;
                fs.appendFileSync('error.log', errorLog);
            } catch (logErr) {
                console.error('Failed to write to error log:', logErr);
            }

            console.error('Error creating route (Controller):', error);
            res.status(500).json({
                error: 'Failed to create route',
                details: error.message,
                hint: error.hint || 'Check server logs for more info'
            });
        }
    }
};

module.exports = RouteController;
