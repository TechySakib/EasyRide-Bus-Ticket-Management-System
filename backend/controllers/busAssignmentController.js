const BusAssignmentModel = require('../models/busAssignmentModel');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || 'placeholder');

const getOrCreateUser = async (authUser) => {
    // Reusing the same logic from ticketController/userController
    // Ideally this should be in a shared utility or middleware
    try {
        const { data: userData } = await supabaseAdmin
            .from('easyride_users')
            .select('id')
            .eq('email', authUser.email)
            .single();

        if (userData) return userData.id;
        // Fallback if user not found (should exist for authenticated users usually)
        return authUser.id;
    } catch (error) {
        return authUser.id;
    }
};

const BusAssignmentController = {
    getAllAssignments: async (req, res) => {
        try {
            const assignments = await BusAssignmentModel.getAllAssignments();
            res.json(assignments);
        } catch (error) {
            console.error('Get all assignments error:', error);
            res.status(500).json({ error: 'Failed to fetch assignments' });
        }
    },

    assignConductor: async (req, res) => {
        try {
            const { id } = req.params;
            const { conductor_id } = req.body;

            const updatedAssignment = await BusAssignmentModel.updateConductor(id, conductor_id);
            res.json({ message: 'Conductor assigned successfully', assignment: updatedAssignment });
        } catch (error) {
            console.error('Assign conductor error:', error);
            res.status(500).json({ error: 'Failed to assign conductor' });
        }
    },

    getConductors: async (req, res) => {
        try {
            const { data, error } = await supabaseAdmin.auth.admin.listUsers();

            if (error) throw error;

            const conductors = data.users
                .filter(user => (user.user_metadata?.role || '').toLowerCase() === 'conductor')
                .map(user => ({
                    id: user.id,
                    name: user.user_metadata?.full_name || user.email, // Fallback to email if name missing
                    email: user.email,
                    role: user.user_metadata?.role
                }));

            res.json(conductors);
        } catch (error) {
            console.error('Get conductors error:', error);
            res.status(500).json({ error: 'Failed to fetch conductors' });
        }
    },

    getDrivers: async (req, res) => {
        try {
            const { data, error } = await supabaseAdmin.auth.admin.listUsers();

            if (error) throw error;

            const drivers = data.users
                .filter(user => (user.user_metadata?.role || '').toLowerCase() === 'driver')
                .map(user => ({
                    id: user.id,
                    name: user.user_metadata?.full_name || user.email,
                    email: user.email,
                    role: user.user_metadata?.role
                }));

            res.json(drivers);
        } catch (error) {
            console.error('Get drivers error:', error);
            res.status(500).json({ error: 'Failed to fetch drivers' });
        }
    },

    createAssignment: async (req, res) => {
        try {
            const assignmentData = req.body;
            const newAssignment = await BusAssignmentModel.createAssignment(assignmentData);
            res.status(201).json({ message: 'Assignment created', assignment: newAssignment });
        } catch (error) {
            console.error('Create assignment error:', error);
            res.status(500).json({ error: 'Failed to create assignment' });
        }
    },

    getFleetStatus: async (req, res) => {
        try {
            console.log('getFleetStatus called');
            const { date } = req.query;
            if (!date) {
                return res.status(400).json({ error: 'Date is required' });
            }

            const BusModel = require('../models/busModel');
            console.log('Fetching buses...');
            const buses = await BusModel.getAllBuses();
            console.log('Buses fetched:', buses?.length);

            const assignments = await BusAssignmentModel.getAssignmentsByDate(date);
            console.log('Assignments fetched:', assignments?.length);

            // Merge data
            const fleetStatus = buses.map(bus => {
                const assignment = assignments.find(a => a.bus_id === bus.id);
                return {
                    ...bus,
                    assignment: assignment || null,
                    status: assignment ? 'assigned' : 'available'
                };
            });

            res.json(fleetStatus);
        } catch (error) {
            console.error('Get fleet status error:', error);
            res.status(500).json({ error: 'Failed to fetch fleet status' });
        }
    },


    getConductorAssignments: async (req, res) => {
        try {
            // Get conductor ID from authenticated user
            const dbUserId = await getOrCreateUser(req.user);

            const assignments = await BusAssignmentModel.getAssignmentsByConductor(dbUserId);
            res.json(assignments);
        } catch (error) {
            console.error('Get conductor assignments error:', error);
            res.status(500).json({ error: 'Failed to fetch conductor assignments' });
        }
    }
};

module.exports = BusAssignmentController;
