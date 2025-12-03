const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in .env');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || 'placeholder');

const BusAssignmentModel = {
    // Get all assignments with details
    getAllAssignments: async () => {
        const { data, error } = await supabaseAdmin
            .from('easyride_bus_assignments')
            .select(`
                *,
                locations (name),
                easyride_buses (bus_number, capacity),
                driver:easyride_users!driver_id (name, email),
                conductor:easyride_users!conductor_id (name, email)
            `)
            .order('departure_time', { ascending: true });

        if (error) {
            console.error('Error fetching assignments:', error);
            throw error;
        }
        return data;
    },

    // Update conductor for an assignment
    updateConductor: async (assignmentId, conductorId) => {
        const { data, error } = await supabaseAdmin
            .from('easyride_bus_assignments')
            .update({ conductor_id: conductorId })
            .eq('id', assignmentId)
            .select()
            .single();

        if (error) {
            console.error('Error updating conductor:', error);
            throw error;
        }
        return data;
    },

    // Get assignments for a specific conductor
    getAssignmentsByConductor: async (conductorId) => {
        const { data, error } = await supabaseAdmin
            .from('easyride_bus_assignments')
            .select(`
                        *,
                        easyride_routes(name),
                        easyride_buses(bus_number),
                        driver: easyride_users!driver_id(name)
            `)
            .eq('conductor_id', conductorId)
            .order('departure_time', { ascending: true });

        if (error) {
            console.error('Error fetching conductor assignments:', error);
            throw error;
        }
        return data;
    },

    // Create a new assignment
    createAssignment: async (assignmentData) => {
        const { data, error } = await supabaseAdmin
            .from('easyride_bus_assignments')
            .insert([assignmentData])
            .select()
            .single();

        if (error) {
            console.error('Error creating assignment:', error);
            throw error;
        }
        return data;
    },

    // Get assignments for a specific date
    getAssignmentsByDate: async (date) => {
        // Date should be YYYY-MM-DD format
        // Filter by assignment_date column (DATE type), not departure_time (TIME type)
        const { data, error } = await supabaseAdmin
            .from('easyride_bus_assignments')
            .select(`
                *,
                locations (name),
                easyride_buses (bus_number, bus_type)
            `)
            .eq('assignment_date', date);

        if (error) {
            console.error('Error fetching assignments by date:', error);
            throw error;
        }
        return data;
    }
};

module.exports = BusAssignmentModel;

