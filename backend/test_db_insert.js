require('dotenv').config({ path: '../.env' });
const TicketModel = require('./models/ticketModel');

async function testInsert() {
    try {
        console.log('Testing direct DB insert...');
        const ticketData = {
            ticket_number: `TEST-${Date.now()}`,
            user_id: 1, // Known valid ID from previous inspection
            issue_title: 'Direct DB Test',
            issue_description: 'Testing direct insertion',
            category: 'other',
            priority: 'medium',
            status: 'open'
        };

        const newTicket = await TicketModel.createTicket(ticketData);
        console.log('Successfully created ticket:', newTicket);
    } catch (error) {
        console.error('Direct insert failed:', error);
    }
}

testInsert();
