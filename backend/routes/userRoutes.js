const express = require('express');
const { requireAdmin } = require('../middleware/roleMiddleware');
const UserController = require('../controllers/userController');

const router = express.Router();


/**
 * Route to create a new user.
 * Requires 'admin' role.
 * @name POST /api/users/create
 * @function
 * @memberof module:routes/userRoutes
 */
router.post('/create', requireAdmin, UserController.createUser);


/**
 * Route to list all users.
 * Requires 'admin' role.
 * @name GET /api/users/list
 * @function
 * @memberof module:routes/userRoutes
 */
router.get('/list', requireAdmin, UserController.listUsers);


/**
 * Route to update the password of the authenticated user.
 * @name POST /api/users/update-password
 * @function
 * @memberof module:routes/userRoutes
 */
router.post('/update-password', UserController.updatePassword);

/**
 * Route to initiate forgot password process.
 * @name POST /api/users/forgot-password
 * @function
 * @memberof module:routes/userRoutes
 */
router.post('/forgot-password', UserController.forgotPassword);

/**
 * Route to update a user's role.
 * Requires 'admin' role.
 * @name POST /api/users/update-role
 * @function
 * @memberof module:routes/userRoutes
 */
router.post('/update-role', requireAdmin, UserController.updateRole);

module.exports = router;

