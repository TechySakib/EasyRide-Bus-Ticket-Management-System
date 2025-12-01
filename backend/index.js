/**
 * EasyRide Backend Server
 * Main entry point for the Express application.
 * @module index
 */

const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/auth');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


/**
 * Health check endpoint.
 * @name GET /
 * @function
 */
app.get('/', (req, res) => {
    res.send('Easy Ride Backend is running!');
});


/**
 * Protected test route.
 * @name GET /api/protected
 * @function
 */
app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({
        message: 'This is a protected route',
        user: req.user
    });
});


app.use('/api/users', userRoutes);
const ticketRoutes = require('./routes/ticketRoutes');
app.use('/api/tickets', ticketRoutes);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
