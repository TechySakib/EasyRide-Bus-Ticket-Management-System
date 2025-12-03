const UserModel = require('../models/userModel');
const { ROLES } = require('../middleware/roleMiddleware');


const UserController = {

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


    forgotPassword: async (req, res) => {
        try {
            const { email } = req.body;

            if (!email) {
                return res.status(400).json({
                    error: 'Missing required field: email'
                });
            }

            const { data, error } = await UserModel.resetPasswordForEmail(email);

            if (error) {
                console.error('Error sending password reset email:', error);
                return res.status(400).json({
                    error: error.message || 'Failed to send password reset email'
                });
            }

            res.json({
                success: true,
                message: 'Password reset email sent successfully'
            });
        } catch (err) {
            console.error('Forgot password error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = UserController;
