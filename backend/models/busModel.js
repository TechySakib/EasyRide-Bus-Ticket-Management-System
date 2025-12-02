const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || 'placeholder');

const BusModel = {
    getAllBuses: async () => {
        console.log('Fetching all buses...');
        const { data, error } = await supabaseAdmin
            .from('easyride_buses')
            .select('*')
            .order('bus_number');

        if (error) {
            console.error('Error fetching buses:', error);
            throw error;
        }
        console.log(`Fetched ${data?.length} buses.`);
        return data;
    }
};

module.exports = BusModel;
