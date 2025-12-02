const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumnType() {
    try {
        // We can't query information_schema directly with supabase-js usually, 
        // unless we have a view or RPC.
        // But we can try to infer it from the error we got: "invalid input syntax for type bigint"
        // This confirms it is bigint.

        console.log("Confirmed from error log: user_id is BIGINT.");

        // Let's check if we can insert a dummy bigint user_id
        const { error } = await supabase
            .from('easyride_support_tickets')
            .insert([{
                ticket_number: 'TEST-BIGINT',
                user_id: 1, // Assuming 1 exists or FK will fail
                issue_title: 'Test',
                category: 'other'
            }]);

        if (error) {
            console.log("Insert with BIGINT 1 failed:", error.message);
        } else {
            console.log("Insert with BIGINT 1 succeeded (or at least passed type check).");
        }

    } catch (err) {
        console.error(err);
    }
}

checkColumnType();
