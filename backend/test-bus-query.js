// Test script to verify database connection and bus data
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('=== Database Connection Test ===');
console.log('Supabase URL:', supabaseUrl);
console.log('Service Key exists:', !!supabaseServiceKey);
console.log('Service Key length:', supabaseServiceKey?.length);

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testBusQuery() {
    try {
        console.log('\n=== Testing Bus Query ===');

        const { data, error, count } = await supabaseAdmin
            .from('easyride_buses')
            .select('*', { count: 'exact' });

        if (error) {
            console.error('❌ Error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
            console.error('Error details:', error.details);
            return;
        }

        console.log(`✅ Query successful!`);
        console.log(`Total buses in database: ${count}`);
        console.log(`Buses returned: ${data?.length || 0}`);

        if (data && data.length > 0) {
            console.log('\n=== Bus Data ===');
            data.forEach((bus, index) => {
                console.log(`${index + 1}. ${bus.bus_number} - ${bus.bus_type} (${bus.capacity} seats) - Status: ${bus.status}`);
            });
        } else {
            console.log('\n⚠️ No buses found in the database!');
            console.log('Please run the SQL migration: backend/migrations/004_add_sample_buses.sql');
        }

    } catch (err) {
        console.error('❌ Exception:', err);
    }
}

testBusQuery();
