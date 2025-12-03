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
const fs = require('fs');
const path = require('path');

exports.validateTicket = async (req, res) => {
    const { qr_code_data } = req.body;

    if (!qr_code_data) {
        return res.status(400).json({ message: 'QR code data is required' });
    }

    try {
        // 1. Check if QR code exists
        const { data: qrCode, error: qrError } = await supabase
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
        const { error: updateError } = await supabase
            .from('easyride_qr_codes')
            .update({ is_scanned: true, scanned_at: new Date().toISOString() })
            .eq('id', qrCode.id);

        if (updateError) {
            throw updateError;
        }

        // 4. Update booking status to 'completed'
        const { error: bookingUpdateError } = await supabase
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

        let { data: bookings, error } = await supabase
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
            .eq('passenger_id', userId)
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
                const { data: newQr, error: qrError } = await supabase
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
};
