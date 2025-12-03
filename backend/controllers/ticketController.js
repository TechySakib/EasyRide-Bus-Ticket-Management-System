/**
 * Ticket Controller
 * Handles ticket validation, booking retrieval, and support ticket operations.
 * @module controllers/ticketController
 */

const TicketModel = require('../models/ticketModel');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');

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

            let { data: bookings, error } = await supabaseAdmin
                .from('easyride_bookings')
                .select(`
                    id,
                    journey_date,
                    booking_status,
                    seat_number,
                    booking_reference,
                    passenger_id,
                    easyride_qr_codes (
                        qr_code_data
                    ),
                    easyride_bus_assignments (
                        easyride_routes (
                            name
                        ),
                        easyride_buses (
                            bus_number
                        )
                    )
                `)
                .eq('passenger_id', dbUserId)
                .order('journey_date', { ascending: false })
                .limit(5);

            if (error) {
                throw error;
            }

            // Check and generate QR codes if missing
            const bookingsWithQr = await Promise.all(bookings.map(async (booking) => {
                // Check if QR code exists (it might be an empty array or null depending on the join)
                const hasQrCode = booking.easyride_qr_codes &&
                    (Array.isArray(booking.easyride_qr_codes) ? booking.easyride_qr_codes.length > 0 : true);

                if (!hasQrCode) {
                    // Generate QR Data
                    const qrData = JSON.stringify({
                        booking_ref: booking.booking_reference,
                        passenger_id: booking.passenger_id
                    });

                    // Insert into DB
                    const { data: newQr, error: qrError } = await supabaseAdmin
                        .from('easyride_qr_codes')
                        .insert([
                            {
                                booking_id: booking.id,
                                qr_code_data: qrData,
                                is_scanned: false
                            }
                        ])
                        .select('qr_code_data')
                        .single();

                    if (!qrError && newQr) {
                        // Attach to booking object for response
                        return {
                            ...booking,
                            easyride_qr_codes: [newQr] // Format as array to match existing structure
                        };
                    } else {
                        console.error('Error generating QR for booking:', booking.id, qrError);
                        return booking;
                    }
                }
                return booking;
            }));

            res.json({ bookings: bookingsWithQr });
        } catch (error) {
            console.error('Error fetching user bookings:', error);
            res.status(500).json({ message: 'Failed to fetch bookings' });
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
    },

    validateTicket: async (req, res) => {
        const { qr_code_data } = req.body;

        if (!qr_code_data) {
            return res.status(400).json({ message: 'QR code data is required' });
        }

        try {
            // 1. Check if QR code exists
            const { data: qrCode, error: qrError } = await supabaseAdmin
                .from('easyride_qr_codes')
                .select('*, easyride_bookings(*, profiles(full_name), easyride_bus_assignments(*, easyride_routes(name), easyride_buses(bus_number)))')
                .eq('qr_code_data', qr_code_data)
                .single();

            if (qrError || !qrCode) {
                return res.status(404).json({ message: 'Invalid QR Code' });
            }

            // 2. Check if already scanned
            if (qrCode.is_scanned) {
                return res.status(400).json({ message: 'Ticket already used/scanned' });
            }

            // 3. Mark as scanned
            const { error: updateError } = await supabaseAdmin
                .from('easyride_qr_codes')
                .update({ is_scanned: true, scanned_at: new Date().toISOString() })
                .eq('id', qrCode.id);

            if (updateError) {
                throw updateError;
            }

            // 4. Update booking status to 'completed'
            const { error: bookingUpdateError } = await supabaseAdmin
                .from('easyride_bookings')
                .update({ booking_status: 'completed' })
                .eq('id', qrCode.booking_id);

            if (bookingUpdateError) {
                console.error('Error updating booking status:', bookingUpdateError);
            }

            // 5. Return ticket details
            const booking = qrCode.easyride_bookings;
            const assignment = booking.easyride_bus_assignments;

            res.json({
                message: 'Ticket Validated Successfully',
                ticket: {
                    passenger_name: booking.profiles?.full_name || 'Unknown',
                    route_name: assignment?.easyride_routes?.name || 'Unknown Route',
                    bus_number: assignment?.easyride_buses?.bus_number || 'Unknown Bus',
                    seat_number: booking.seat_number,
                    booking_date: booking.journey_date,
                    departure_time: assignment?.departure_time,
                    status: 'completed'
                }
            });

        } catch (error) {
            console.error('Validation Error:', error);
            res.status(500).json({ message: 'Server error during validation' });
        }
    }
};

module.exports = TicketController;
