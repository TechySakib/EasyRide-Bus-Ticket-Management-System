const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkEnum() {
    try {
        const { data, error } = await supabase.rpc('get_enum_values', { enum_name: 'ticket_category_enum' });

        // If RPC doesn't exist (likely), try querying pg_type directly if possible, 
        // but Supabase client might not allow direct SQL execution easily without RPC.
        // Alternatively, try to insert a dummy ticket with a wrong category and see the error message,
        // or just try to fetch the definition if I can.

        // Actually, let's just try to insert a row with a known invalid category and catch the error, 
        // the error message usually lists allowed values.

        const { error: insertError } = await supabase
            .from('easyride_support_tickets')
            .insert([{
                ticket_number: 'TEST-ENUM-CHECK',
                issue_title: 'Test',
                category: 'INVALID_CATEGORY_XYZ'
            }]);

        if (insertError) {
            console.log('Insert Error (Expected):', insertError.message);
            console.log('Details:', insertError.details);
            console.log('Hint:', insertError.hint);
        } else {
            console.log('Unexpectedly inserted invalid category!');
        }

    } catch (err) {
        console.error('Script error:', err);
    }
}

checkEnum();
