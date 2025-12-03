const express = require('express');
const router = express.Router();
const BusAssignmentController = require('../controllers/busAssignmentController');
const authMiddleware = require('../middleware/auth');

// Get all assignments (Admin)
router.get('/', authMiddleware, BusAssignmentController.getAllAssignments);

// Create assignment (Admin)
router.post('/', authMiddleware, BusAssignmentController.createAssignment);

// Get fleet status (Admin)
router.get('/fleet-status', authMiddleware, BusAssignmentController.getFleetStatus);

// Get conductors (Admin)
router.get('/conductors', authMiddleware, BusAssignmentController.getConductors);

// Get drivers (Admin)
router.get('/drivers', authMiddleware, BusAssignmentController.getDrivers);

// Assign conductor (Admin)
router.patch('/:id/conductor', authMiddleware, BusAssignmentController.assignConductor);

// Get conductor's assignments (Conductor)
router.get('/conductor/my-trips', authMiddleware, BusAssignmentController.getConductorAssignments);

module.exports = router;
