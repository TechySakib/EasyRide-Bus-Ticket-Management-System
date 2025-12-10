const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });


const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || 'placeholder');

const BusModel = {
    getAllBuses: async () => {
        console.log('=== BusModel.getAllBuses called ===');
        console.log('Supabase URL:', supabaseUrl);
        console.log('Service Key exists:', !!supabaseServiceKey);

        try {
            const { data, error } = await supabaseAdmin
                .from('easyride_buses')
                .select('*')
                .order('bus_number');

            if (error) {
                console.error('❌ Error fetching buses:', error);
                console.error('Error details:', JSON.stringify(error, null, 2));
                throw error;
            }

            console.log(`✅ Successfully fetched ${data?.length || 0} buses`);
            if (data && data.length > 0) {
                console.log('First bus:', data[0]);
            } else {
                console.log('⚠️ No buses found in database');
            }

            return data;
        } catch (err) {
            console.error('❌ Exception in getAllBuses:', err);
            throw err;
        }
    }
};

module.exports = BusModel;
