const BookingModel = require('../models/bookingModel');

const BookingController = {

    /**
     * Retrieves the booking history for a specific user.
     * 
     * @param {Object} req - The request object.
     * @param {Object} req.params - The request parameters.
     * @param {string} req.params.userId - The ID of the user to fetch history for.
     * @param {Object} req.user - The authenticated user object.
     * @param {Object} res - The response object.
     * @returns {Promise<void>} Sends a JSON response with the booking history or an error message.
     */
    getBookingHistory: async (req, res) => {
        try {
            const { userId } = req.params;

            // Security check: Ensure the requesting user is accessing their own data
            // or is an admin. (Assuming req.user is populated by auth middleware)
            if (req.user.id !== userId && req.user.role !== 'admin') {
                return res.status(403).json({ error: 'Unauthorized access to booking history' });
            }

            const { data, error } = await BookingModel.getBookingHistory(userId);

            if (error) {
                console.error('Error fetching booking history:', error);
                return res.status(400).json({ error: error.message });
            }

            // Transform data to a cleaner format for frontend if necessary
            const formattedHistory = data.map(booking => ({
                id: booking.id,
                reference: booking.booking_reference,
                date: booking.journey_date, // Journey Date
                bookingDate: booking.booking_date, // When it was booked
                time: booking.easyride_bus_assignments?.departure_time,
                busNumber: booking.easyride_bus_assignments?.easyride_buses?.bus_number,
                busType: booking.easyride_bus_assignments?.easyride_buses?.bus_type,
                route: booking.easyride_bus_assignments?.easyride_routes?.name,
                origin: booking.easyride_bus_assignments?.easyride_routes?.origin_location || 'N/A',
                destination: booking.easyride_bus_assignments?.easyride_routes?.destination_location || 'N/A',
                seat: booking.seat_number,
                status: booking.booking_status,
                amount: booking.amount_paid
            }));

            res.json({ bookings: formattedHistory });
        } catch (err) {
            console.error('Get booking history error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
};

module.exports = BookingController;
