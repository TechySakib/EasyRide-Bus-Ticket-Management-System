const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.warn('WARNING: SUPABASE_SERVICE_ROLE_KEY not set. Admin actions will fail.');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || 'placeholder');

const RouteModel = {
    createLocation: async (name) => {
        return await supabaseAdmin
            .from('locations')
            .insert([{ name }])
            .select()
            .single();
    },

    findLocationByName: async (name) => {
        return await supabaseAdmin
            .from('locations')
            .select('id')
            .eq('name', name)
            .single();
    },

    createRoutes: async (routes) => {
        return await supabaseAdmin
            .from('easyride_routes')
            .insert(routes);
    }
};

module.exports = RouteModel;
