/**
 * Ticket Controller
 * Handles ticket validation and related operations.
 * @module controllers/ticketController
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

/**
 * Validates a scanned QR code for a bus ticket.
 * 
 * @async
 * @function validateTicket
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.qr_code_data - The scanned QR code data string
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with ticket details or error message
 */
exports.validateTicket = async (req, res) => {
    const { qr_code_data } = req.body;

    if (!qr_code_data) {
        return res.status(400).json({ message: 'QR code data is required' });
    }

    try {
        // 1. Check if QR code exists
        const { data: qrCode, error: qrError } = await supabase
            .from('easyride_qr_codes')
            .select('*, easyride_bookings(*, easyride_users(name), easyride_bus_assignments(*, easyride_routes(name), easyride_buses(bus_number)))')
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
        const { error: updateError } = await supabase
            .from('easyride_qr_codes')
            .update({ is_scanned: true, scanned_at: new Date().toISOString() })
            .eq('id', qrCode.id);

        if (updateError) {
            throw updateError;
        }

        // 4. Return ticket details
        const booking = qrCode.easyride_bookings;
        res.json({
            message: 'Ticket Validated Successfully',
            passenger_name: booking.easyride_users.name,
            route_name: booking.easyride_bus_assignments.easyride_routes.name,
            bus_number: booking.easyride_bus_assignments.easyride_buses.bus_number,
            seat_number: booking.seat_number,
            journey_date: booking.journey_date,
            booking_status: booking.booking_status
        });

    } catch (error) {
        console.error('Validation Error:', error);
        res.status(500).json({ message: 'Server error during validation' });
    }
};

/**
 * Retrieves bookings for the authenticated user.
 * 
 * @async
 * @function getUserBookings
 * @param {Object} req - Express request object
 * @param {Object} req.user - Authenticated user object
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends a JSON response with user bookings
 */
exports.getUserBookings = async (req, res) => {
    try {
        const userId = req.user.id;

        const { data: bookings, error } = await supabase
            .from('easyride_bookings')
            .select(`
                id,
                journey_date,
                booking_status,
                seat_number,
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
            .eq('passenger_id', userId)
            .order('journey_date', { ascending: false })
            .limit(5);

        if (error) {
            throw error;
        }

        res.json({ bookings });
    } catch (error) {
        console.error('Error fetching user bookings:', error);
        res.status(500).json({ message: 'Failed to fetch bookings' });
    }
};
