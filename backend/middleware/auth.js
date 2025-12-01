const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();








const supabaseUrl = process.env.SUPABASE_URL || 'https://arctidbknjjajstoitas.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_Qpg550_nF9GVcZA4CejHgA_79GIdXvk';

const supabase = createClient(supabaseUrl, supabaseKey);

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
