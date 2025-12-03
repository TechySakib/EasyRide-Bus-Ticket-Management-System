const http = require('http');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testAdminAPI() {
    console.log('Testing Admin API protection...');

    const options = {
        hostname: 'localhost',
        port: 5000,
        path: '/api/tickets/admin/all',
        method: 'GET'
    };

    const req = http.request(options, (res) => {
        console.log('GET /admin/all status (should be 401):', res.statusCode);
        if (res.statusCode === 401) {
            console.log('SUCCESS: Admin route is protected.');
        } else {
            console.log('FAILURE: Admin route is NOT protected properly.');
        }
    });

    req.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    req.end();
}

testAdminAPI();
