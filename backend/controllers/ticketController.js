const TicketModel = require('../models/ticketModel');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || 'placeholder');

const getOrCreateUser = async (authUser) => {
    try {
        const { data: userData, error: userError } = await supabaseAdmin
            .from('easyride_users')
            .select('id')
            .eq('email', authUser.email)
            .single();

        if (userData) return userData.id;

        // If user doesn't exist, create them
        console.log('User not found in easyride_users, creating new record for:', authUser.email);
        const name = authUser.user_metadata?.full_name || authUser.email.split('@')[0];

        const { data: newUser, error: createError } = await supabaseAdmin
            .from('easyride_users')
            .insert([{
                email: authUser.email,
                name: name,
                password_hash: 'managed_by_supabase_auth',
                role: 'passenger',
                is_active: true
            }])
            .select('id')
            .single();

        if (createError) {
            console.error('Failed to create user:', createError);
            throw createError;
        }

        return newUser.id;
    } catch (error) {
        console.error('getOrCreateUser error:', error);
        throw error;
    }
};

const TicketController = {
    createTicket: async (req, res) => {
        try {
            const { user_id, booking_id, issue_title, issue_description, category, priority } = req.body;

            // Generate a unique ticket number (e.g., TKT-TIMESTAMP-RANDOM)
            const ticket_number = `TKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

            console.log('Create Ticket Request Received');

            if (!req.user || !req.user.email) {
                return res.status(401).json({ error: 'User email not found in token' });
            }

            const dbUserId = await getOrCreateUser(req.user);

            const ticketData = {
                ticket_number,
                user_id: dbUserId,
                booking_id: booking_id || null,
                issue_title,
                issue_description,
                category,
                priority: priority || 'medium',
                status: 'open'
            };

            const newTicket = await TicketModel.createTicket(ticketData);

            // Record creation activity
            await TicketModel.addActivity({
                ticket_id: newTicket.id,
                activity_type: 'created',
                performed_by: dbUserId,
                comment_text: 'Ticket created',
                new_status: 'open'
            });

            res.status(201).json({ message: 'Ticket created successfully', ticket: newTicket });
        } catch (error) {
            console.error('Create ticket error:', error);
            res.status(500).json({ error: 'Failed to create ticket', details: error.message });
        }
    },

    getUserTickets: async (req, res) => {
        try {
            const dbUserId = await getOrCreateUser(req.user);
            const tickets = await TicketModel.getTicketsByUserId(dbUserId);
            res.json(tickets);
        } catch (error) {
            console.error('Get user tickets error:', error);
            res.status(500).json({ error: 'Failed to fetch tickets' });
        }
    },

    getTicketDetails: async (req, res) => {
        try {
            const { id } = req.params;
            const ticket = await TicketModel.getTicketById(id);
            res.json(ticket);
        } catch (error) {
            console.error('Get ticket details error:', error);
            res.status(500).json({ error: 'Failed to fetch ticket details' });
        }
    },

    addTicketComment: async (req, res) => {
        try {
            const { id } = req.params;
            const { comment_text } = req.body;

            const dbUserId = await getOrCreateUser(req.user);

            const activity = await TicketModel.addActivity({
                ticket_id: id,
                activity_type: 'commented',
                performed_by: dbUserId,
                comment_text
            });

            res.status(201).json({ message: 'Comment added', activity });
        } catch (error) {
            console.error('Add comment error:', error);
            res.status(500).json({ error: 'Failed to add comment' });
        }
    },

    getUserBookings: async (req, res) => {
        try {
            const dbUserId = await getOrCreateUser(req.user);

            const { data, error } = await supabaseAdmin
                .from('easyride_bookings')
                .select(`
                    id,
                    booking_reference,
                    journey_date,
                    seat_number,
                    easyride_bus_assignments (
                        easyride_routes (
                            name
                        )
                    )
                `)
                .eq('passenger_id', dbUserId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            res.json(data);
        } catch (error) {
            console.error('Get user bookings error:', error);
            res.status(500).json({ error: 'Failed to fetch bookings' });
        }
    },

    // Admin: Get all tickets
    getAllTickets: async (req, res) => {
        try {
            const tickets = await TicketModel.getAllTickets();
            res.json(tickets);
        } catch (error) {
            console.error('Get all tickets error:', error);
            res.status(500).json({ error: 'Failed to fetch tickets', details: error.message, hint: error.hint });
        }
    },

    // Admin: Update ticket status
    updateTicketStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            // Lookup admin ID from easyride_users
            const dbAdminId = await getOrCreateUser(req.user);

            const updatedTicket = await TicketModel.updateTicketStatus(id, status);

            // Record activity
            await TicketModel.addActivity({
                ticket_id: id,
                activity_type: 'status_changed',
                performed_by: dbAdminId,
                new_status: status,
                comment_text: `Status updated to ${status}`
            });

            res.json({ message: 'Ticket status updated', ticket: updatedTicket });
        } catch (error) {
            console.error('Update ticket status error:', error);
            res.status(500).json({ error: 'Failed to update ticket status' });
        }
    }
};

module.exports = TicketController;
