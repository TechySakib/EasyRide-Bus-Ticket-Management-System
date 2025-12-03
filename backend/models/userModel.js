const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY not set. Admin actions will fail.');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || 'placeholder');


const UserModel = {

    /**
     * Creates a new user in Supabase with the specified details.
     * @param {Object} params - The user creation parameters.
     * @param {string} params.email - The email of the user.
     * @param {string} params.password - The password for the user.
     * @param {Object} params.metadata - Additional user metadata (e.g., role, name, phone).
     * @returns {Promise<{ data: Object, error: Object }>} The result of the create user operation.
     */
    createUser: async ({ email, password, metadata }) => {
        return await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: metadata
        });
    },


    /**
     * Lists all users from Supabase.
     * @returns {Promise<{ data: { users: Array<Object> }, error: Object }>} The list of users or an error.
     */
    listUsers: async () => {
        return await supabaseAdmin.auth.admin.listUsers();
    },


    /**
     * Retrieves a user by their authentication token.
     * @param {string} token - The authentication token.
     * @returns {Promise<{ data: { user: Object }, error: Object }>} The user data or an error.
     */
    getUserByToken: async (token) => {
        return await supabaseAdmin.auth.getUser(token);
    },


    /**
     * Updates a user's information by their ID.
     * @param {string} userId - The ID of the user to update.
     * @param {Object} updates - The updates to apply (e.g., password, metadata).
     * @returns {Promise<{ data: { user: Object }, error: Object }>} The updated user data or an error.
     */
    updateUserById: async (userId, updates) => {
        return await supabaseAdmin.auth.admin.updateUserById(userId, updates);
    },


    /**
     * Sends a password reset email to the specified email address.
     * @param {string} email - The email address to send the reset link to.
     * @returns {Promise<{ data: Object, error: Object }>} The result of the reset password operation.
     */
    resetPasswordForEmail: async (email) => {
        return await supabaseAdmin.auth.resetPasswordForEmail(email, {
            redirectTo: 'http://localhost:3000/update-password',
        });
    }
};

module.exports = UserModel;
