const http = require('http');

const data = JSON.stringify({
    user_id: '123e4567-e89b-12d3-a456-426614174000',
    issue_title: 'Test Issue',
    issue_description: 'This is a test',
    category: 'other',
    priority: 'medium'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/tickets',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`Status: ${res.statusCode}`);
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
        console.log('Response:', body);
        require('fs').writeFileSync('error_log.txt', body);
    });
});

req.on('error', (error) => {
    console.error(error);
});

req.write(data);
req.end();
