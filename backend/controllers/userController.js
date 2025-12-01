const UserModel = require('../models/userModel');
const { ROLES } = require('../middleware/roleMiddleware');

/**
 * User Controller
 * Handles user management operations such as creation, listing, and updates.
 * @namespace UserController
 */
const UserController = {

    /**
     * Creates a new user.
     * 
     * @async
     * @function createUser
     * @memberof UserController
     * @param {Object} req - Express request object
     * @param {Object} req.body - Request body
     * @param {string} req.body.email - User email
     * @param {string} req.body.password - User password
     * @param {string} req.body.role - User role (passenger, admin, conductor)
     * @param {string} [req.body.name] - User full name
     * @param {string} [req.body.phone] - User phone number
     * @param {string} [req.body.studentId] - Student ID (if applicable)
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response with created user or error
     */
    createUser: async (req, res) => {
        try {
            console.log('Received create user request:', req.body);
            const { email, password, role, name, phone, studentId } = req.body;


            if (!email || !password || !role) {
                console.log('Missing required fields:', { email: !!email, password: !!password, role: !!role });
                return res.status(400).json({
                    error: 'Missing required fields',
                    required: ['email', 'password', 'role']
                });
            }


            const validRoles = [ROLES.PASSENGER, ROLES.ADMIN, ROLES.CONDUCTOR];
            if (!validRoles.includes(role)) {
                console.log('Invalid role:', role, 'Valid roles:', validRoles);
                return res.status(400).json({
                    error: 'Invalid role',
                    validRoles
                });
            }


            if (password.length < 6) {
                return res.status(400).json({
                    error: 'Password must be at least 6 characters'
                });
            }


            const { data, error } = await UserModel.createUser({
                email,
                password,
                metadata: {
                    full_name: name || '',
                    phone: phone || '',
                    student_id: studentId || '',
                    role: role
                }
            });

            if (error) {
                console.error('Error creating user:', error);
                return res.status(400).json({
                    error: error.message || 'Failed to create user'
                });
            }


            res.status(201).json({
                success: true,
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    role: role,
                    name: name,
                    phone: phone,
                    created_at: data.user.created_at
                }
            });
        } catch (err) {
            console.error('Create user error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },


    /**
     * Lists all users.
     * 
     * @async
     * @function listUsers
     * @memberof UserController
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response with list of users
     */
    listUsers: async (req, res) => {
        try {
            const { data, error } = await UserModel.listUsers();

            if (error) {
                console.error('Error listing users:', error);
                return res.status(400).json({ error: error.message });
            }


            const users = data.users.map(user => ({
                id: user.id,
                email: user.email,
                role: user.user_metadata?.role || 'passenger',
                name: user.user_metadata?.full_name || '',
                phone: user.user_metadata?.phone || '',
                created_at: user.created_at,
                last_sign_in: user.last_sign_in_at
            }));

            res.json({ users });
        } catch (err) {
            console.error('List users error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },


    /**
     * Updates the password for the authenticated user.
     * 
     * @async
     * @function updatePassword
     * @memberof UserController
     * @param {Object} req - Express request object
     * @param {Object} req.body - Request body
     * @param {string} req.body.newPassword - New password
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response indicating success or failure
     */
    updatePassword: async (req, res) => {
        try {
            const authHeader = req.headers.authorization;

            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Missing or invalid authorization header' });
            }

            const token = authHeader.split(' ')[1];
            const { data: { user }, error: authError } = await UserModel.getUserByToken(token);

            if (authError || !user) {
                return res.status(401).json({ error: 'Invalid or expired token' });
            }

            const { newPassword } = req.body;

            if (!newPassword) {
                return res.status(400).json({
                    error: 'Missing required field: newPassword'
                });
            }

            if (newPassword.length < 6) {
                return res.status(400).json({
                    error: 'Password must be at least 6 characters'
                });
            }

            const { data, error } = await UserModel.updateUserById(user.id, { password: newPassword });

            if (error) {
                console.error('Error updating password:', error);
                return res.status(400).json({
                    error: error.message || 'Failed to update password'
                });
            }

            res.json({
                success: true,
                message: 'Password updated successfully'
            });
        } catch (err) {
            console.error('Update password error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },


    /**
     * Updates a user's role.
     * 
     * @async
     * @function updateRole
     * @memberof UserController
     * @param {Object} req - Express request object
     * @param {Object} req.body - Request body
     * @param {string} req.body.userId - ID of the user to update
     * @param {string} req.body.newRole - New role to assign
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response with updated user details
     */
    updateRole: async (req, res) => {
        try {
            const { userId, newRole } = req.body;

            if (!userId || !newRole) {
                return res.status(400).json({
                    error: 'Missing required fields',
                    required: ['userId', 'newRole']
                });
            }

            const validRoles = [ROLES.PASSENGER, ROLES.ADMIN, ROLES.CONDUCTOR];
            if (!validRoles.includes(newRole)) {
                return res.status(400).json({
                    error: 'Invalid role',
                    validRoles
                });
            }

            const { data, error } = await UserModel.updateUserById(userId, {
                user_metadata: { role: newRole }
            });

            if (error) {
                console.error('Error updating user role:', error);
                return res.status(400).json({
                    error: error.message || 'Failed to update user role'
                });
            }

            res.json({
                success: true,
                message: 'User role updated successfully',
                user: {
                    id: data.user.id,
                    email: data.user.email,
                    role: newRole
                }
            });
        } catch (err) {
            console.error('Update role error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    /**
     * Logs user access to the scan page.
     * 
     * @async
     * @function logAccess
     * @memberof UserController
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>} Sends JSON response
     */
    logAccess: async (req, res) => {
        try {
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                return res.status(401).json({ error: 'Missing or invalid authorization header' });
            }

            const token = authHeader.split(' ')[1];
            const { data: { user }, error } = await UserModel.getUserByToken(token);

            if (error || !user) {
                console.log('Access Log: Unauthenticated access attempt');
                return res.status(401).json({ error: 'Invalid token' });
            }

            const role = user.user_metadata?.role || 'passenger';
            const logMessage = `[${new Date().toISOString()}] User: ${user.email}, Role: ${role} accessed Scan Page\n`;

            console.log('Access Log:', logMessage.trim());

            const fs = require('fs');
            const path = require('path');
            const logPath = path.join(__dirname, '../access.log');

            fs.appendFile(logPath, logMessage, (err) => {
                if (err) console.error('Failed to write to access log:', err);
            });

            res.json({ success: true, role });
        } catch (err) {
            console.error('Log access error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = UserController;
