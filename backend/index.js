require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const authMiddleware = require('./middleware/auth');
const userRoutes = require('./routes/userRoutes');

const app = express();
const port = process.env.PORT || 5000;

/**
 * Main Application Entry Point
 * Configures Express server, middleware, and routes.
 */


app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
    res.send('Easy Ride Backend is running!');
});


app.get('/api/protected', authMiddleware, (req, res) => {
    res.json({
        message: 'This is a protected route',
        user: req.user
    });
});


app.use('/api/users', userRoutes);
const routeRoutes = require('./routes/routeRoutes');
app.use('/api/routes', routeRoutes);
const ticketRoutes = require('./routes/ticketRoutes');
app.use('/api/tickets', ticketRoutes);
const busAssignmentRoutes = require('./routes/busAssignmentRoutes');
app.use('/api/assignments', busAssignmentRoutes);
const chatRoutes = require('./routes/chatRoutes');
app.use('/api', chatRoutes);


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
