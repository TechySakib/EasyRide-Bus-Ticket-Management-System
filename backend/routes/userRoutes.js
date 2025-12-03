/**
 * User Routes
 * Defines API endpoints for user management.
 * @module routes/userRoutes
 */

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


/**
 * Route to log user access to scan page.
 * @name POST /api/users/log-access
 * @function
 * @memberof module:routes/userRoutes
 * @inner
 */
router.post('/log-access', UserController.logAccess);

module.exports = router;
