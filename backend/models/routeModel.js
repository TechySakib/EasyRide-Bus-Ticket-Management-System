const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in .env');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || 'placeholder');

/**
 * Route Model
 * Handles database interactions for locations and routes.
 */
const RouteModel = {
    /**
     * Creates a new location if it doesn't exist.
     * 
     * @param {string} name - Name of the location
     * @returns {Promise<Object>} The location object
     * @throws {Error} If database operation fails
     */
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

    /**
     * Creates a new route in the database.
     * 
     * @param {Object} routeData - Route data object
     * @param {string} routeData.name - Route name
     * @param {number} routeData.origin_id - Origin location ID
     * @param {number} routeData.destination_id - Destination location ID
     * @param {number} routeData.distance_km - Distance in km
     * @param {number} routeData.estimated_time_minutes - Estimated time in minutes
     * @param {string} routeData.route_status - Status of the route
     * @returns {Promise<Object>} The created route object
     * @throws {Error} If database operation fails
     */
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

    /**
     * Finds a route between two locations.
     * 
     * @param {number} originId - Origin location ID
     * @param {number} destinationId - Destination location ID
     * @returns {Promise<Object|null>} The route object if found, otherwise null
     */
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
