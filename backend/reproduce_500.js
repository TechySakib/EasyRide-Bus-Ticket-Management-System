const fetch = require('node-fetch');

async function testSubmit() {
    try {
        const response = await fetch('http://localhost:5000/api/tickets', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: '123e4567-e89b-12d3-a456-426614174000', // UUID format
                issue_title: 'Test Issue',
                issue_description: 'This is a test',
                category: 'other',
                priority: 'medium'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
    } catch (err) {
        console.error('Error:', err);
    }
}

testSubmit();
