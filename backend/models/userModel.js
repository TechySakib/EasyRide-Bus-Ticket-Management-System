const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY not set. Admin actions will fail.');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || 'placeholder');


const UserModel = {
    
    createUser: async ({ email, password, metadata }) => {
        return await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: metadata
        });
    },

    
    listUsers: async () => {
        return await supabaseAdmin.auth.admin.listUsers();
    },

    
    getUserByToken: async (token) => {
        return await supabaseAdmin.auth.getUser(token);
    },

    
    updateUserById: async (userId, updates) => {
        return await supabaseAdmin.auth.admin.updateUserById(userId, updates);
    },

    
    resetPasswordForEmail: async (email) => {
        return await supabaseAdmin.auth.resetPasswordForEmail(email, {
            redirectTo: 'http://localhost:3000/update-password',
        });
    }
};

module.exports = UserModel;
