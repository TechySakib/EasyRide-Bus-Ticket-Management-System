const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });








const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔐 Auth Middleware Init:', {
    url: supabaseUrl,
    keyPresent: !!supabaseKey,
    keyPrefix: supabaseKey ? supabaseKey.substring(0, 5) + '...' : 'none'
});

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in auth middleware');
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
    }
});

/**
 * Authentication Middleware
 * Verifies the JWT token from the Authorization header using Supabase Auth.
 * Attaches the user object to the request if successful.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.headers - Request headers
 * @param {string} req.headers.authorization - Bearer token
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Promise<void>} Calls next() if authenticated, otherwise sends 401/500 response
 */
const authMiddleware = async (req, res, next) => {
    try {

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid authorization header' });
        }

        const token = authHeader.split(' ')[1];


        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            console.error('Auth error:', error);
            return res.status(401).json({ error: 'Invalid or expired token' });
        }


        req.user = user;
        next();
    } catch (err) {
        console.error('Middleware error:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = authMiddleware;
