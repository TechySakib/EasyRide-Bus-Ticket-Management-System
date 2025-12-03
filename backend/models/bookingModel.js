const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey || 'placeholder');

const BookingModel = {
    /**
     * Get booking history for a specific passenger
     * @param {string} passengerId - The ID of the passenger
     * @returns {Promise<{data: any[], error: any}>}
     */
    getBookingHistory: async (passengerId) => {
        // We need to join with bus_assignments, routes, and buses to get full details
        // Supabase join syntax:
        // select('*, easyride_bus_assignments(*, easyride_routes(*), easyride_buses(*))')

        const { data, error } = await supabase
            .from('easyride_bookings')
            .select(`
                id,
                booking_reference,
                seat_number,
                booking_status,
                booking_date,
                journey_date,
                amount_paid,
                easyride_bus_assignments (
                    departure_time,
                    arrival_time,
                    easyride_routes (
                        name
                    )
                )
            `)
            .eq('passenger_id', passengerId)
            .order('journey_date', { ascending: false });

        return { data, error };
    }
};

module.exports = BookingModel;
