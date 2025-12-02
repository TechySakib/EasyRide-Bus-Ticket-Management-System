const express = require('express');
const { requireAdmin } = require('../middleware/roleMiddleware');
const UserController = require('../controllers/userController');

const router = express.Router();


/**
 * POST /api/users/create
 * Creates a new user.
 * Protected by Admin Middleware.
 */
router.post('/create', requireAdmin, UserController.createUser);


/**
 * GET /api/users/list
 * Lists all users.
 * Protected by Admin Middleware.
 */
router.get('/list', requireAdmin, UserController.listUsers);


/**
 * POST /api/users/update-password
 * Updates the authenticated user's password.
 */
router.post('/update-password', UserController.updatePassword);


/**
 * POST /api/users/update-role
 * Updates a user's role.
 * Protected by Admin Middleware.
 */
router.post('/update-role', requireAdmin, UserController.updateRole);

module.exports = router;

