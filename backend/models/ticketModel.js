const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
    console.error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing in .env');
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || 'placeholder');

const TicketModel = {
    // Create a new ticket
    createTicket: async (ticketData) => {
        const { data, error } = await supabaseAdmin
            .from('easyride_support_tickets')
            .insert([ticketData])
            .select()
            .single();

        if (error) {
            console.error('Error creating ticket:', error);
            throw error;
        }
        return data;
    },

    // Get tickets by user ID
    getTicketsByUserId: async (userId) => {
        const { data, error } = await supabaseAdmin
            .from('easyride_support_tickets')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching user tickets:', error);
            throw error;
        }
        return data;
    },

    // Get ticket by ID
    getTicketById: async (ticketId) => {
        const { data, error } = await supabaseAdmin
            .from('easyride_support_tickets')
            .select(`
                *,
                easyride_ticket_activities (*)
            `)
            .eq('id', ticketId)
            .single();

        if (error) {
            console.error('Error fetching ticket details:', error);
            throw error;
        }
        return data;
    },

    // Add activity/comment to a ticket
    addActivity: async (activityData) => {
        const { data, error } = await supabaseAdmin
            .from('easyride_ticket_activities')
            .insert([activityData])
            .select()
            .single();

        if (error) {
            console.error('Error adding ticket activity:', error);
            throw error;
        }
        return data;
    },

    // Update ticket status
    updateTicketStatus: async (ticketId, status) => {
        const updates = { status, updated_at: new Date() };
        if (status === 'resolved' || status === 'closed') {
            updates.resolved_at = new Date();
        }

        const { data, error } = await supabaseAdmin
            .from('easyride_support_tickets')
            .update(updates)
            .eq('id', ticketId)
            .select()
            .single();

        if (error) {
            console.error('Error updating ticket status:', error);
            throw error;
        }
        return data;
    },

    // Get all tickets (Admin)
    getAllTickets: async () => {
        const { data, error } = await supabaseAdmin
            .from('easyride_support_tickets')
            .select(`
                *,
                easyride_users:easyride_users!easyride_support_tickets_user_id_fkey (name, email)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching all tickets:', error);
            throw error;
        }
        return data;
    }
};

module.exports = TicketModel;
