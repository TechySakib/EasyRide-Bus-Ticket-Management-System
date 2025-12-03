const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

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
                easyride_routes (name, origin_id, destination_id),
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
                easyride_routes (name),
                easyride_buses (bus_number),
                driver:easyride_users!driver_id (name)
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
        // Assuming date is YYYY-MM-DD
        // We need to filter where departure_time starts with this date
        const startOfDay = `${date}T00:00:00`;
        const endOfDay = `${date}T23:59:59`;

        const { data, error } = await supabaseAdmin
            .from('easyride_bus_assignments')
            .select(`
                *,
                easyride_routes (name),
                easyride_buses (bus_number, bus_type),
                driver:easyride_users!driver_id (name),
                conductor:easyride_users!conductor_id (name)
            `)
            .gte('departure_time', startOfDay)
            .lte('departure_time', endOfDay);

        if (error) {
            console.error('Error fetching assignments by date:', error);
            throw error;
        }
        return data;
    }
};

module.exports = BusAssignmentModel;
