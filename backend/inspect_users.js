const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectUsers() {
    try {
        const { data, error } = await supabase
            .from('easyride_users')
            .select('*');

        if (error) {
            console.error('Error:', error);
        } else {
            console.log('easyride_users row:', data);
            require('fs').writeFileSync('user_data.txt', JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error(err);
    }
}

inspectUsers();
