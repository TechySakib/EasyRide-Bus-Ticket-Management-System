const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in .env');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || 'placeholder');

const RouteModel = {
    // Create a new location if it doesn't exist
    createLocation: async (name) => {
        try {
            // First check if it exists
            const { data: existing, error: findError } = await supabaseAdmin
                .from('locations')
                .select('*')
                .ilike('name', name)
                .single();

            if (findError && findError.code !== 'PGRST116') { // PGRST116 is "Row not found"
                console.error('Error finding location:', findError);
                throw findError;
            }

            if (existing) return existing;

            const { data, error } = await supabaseAdmin
                .from('locations')
                .insert([{ name }])
                .select()
                .single();

            if (error) {
                console.error('Error creating location:', error);
                throw error;
            }
            return data;
        } catch (err) {
            console.error('RouteModel.createLocation failed:', err);
            throw err;
        }
    },

    // Create a new route
    createRoute: async (routeData) => {
        const { data, error } = await supabaseAdmin
            .from('easyride_routes')
            .insert([routeData])
            .select()
            .single();

        if (error) {
            console.error('Error creating route in DB:', error);
            throw error;
        }
        return data;
    },

    // Check if route exists
    findRoute: async (originId, destinationId) => {
        const { data, error } = await supabaseAdmin
            .from('easyride_routes')
            .select('*')
            .eq('origin_id', originId)
            .eq('destination_id', destinationId)
            .single();

        if (error && error.code !== 'PGRST116') {
            console.error('Error finding route:', error);
        }

        return data;
    }
};

module.exports = RouteModel;
