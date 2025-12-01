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
 * Route to create a new user.
 * Requires Admin privileges.
 * @name POST /api/users/create
 * @function
 * @memberof module:routes/userRoutes
 * @inner
 */
router.post('/create', requireAdmin, UserController.createUser);


/**
 * Route to list all users.
 * Requires Admin privileges.
 * @name GET /api/users/list
 * @function
 * @memberof module:routes/userRoutes
 * @inner
 */
router.get('/list', requireAdmin, UserController.listUsers);


/**
 * Route to update the current user's password.
 * @name POST /api/users/update-password
 * @function
 * @memberof module:routes/userRoutes
 * @inner
 */
router.post('/update-password', UserController.updatePassword);


/**
 * Route to update a user's role.
 * Requires Admin privileges.
 * @name POST /api/users/update-role
 * @function
 * @memberof module:routes/userRoutes
 * @inner
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

