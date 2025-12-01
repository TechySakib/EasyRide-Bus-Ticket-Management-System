/**
 * Role Middleware
 * Handles role-based access control.
 * @module middleware/roleMiddleware
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://arctidbknjjajstoitas.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_Qpg550_nF9GVcZA4CejHgA_79GIdXvk';

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * User Roles Enum
 * @readonly
 * @enum {string}
 */
const ROLES = {
    PASSENGER: 'passenger',
    ADMIN: 'admin',
    CONDUCTOR: 'conductor',

    STUDENT: 'student'
};


/**
 * Normalizes a user role string.
 * Maps 'student' to 'passenger'.
 * 
 * @function normalizeRole
 * @param {string} role - The role to normalize
 * @returns {string} The normalized role
 */
const normalizeRole = (role) => {
    if (role === ROLES.STUDENT) {
        return ROLES.PASSENGER;
    }
    return role;
};


/**
 * Creates a middleware function that restricts access to specified roles.
 * 
 * @function requireRole
 * @param {string|string[]} allowedRoles - Role or array of roles allowed to access the route
 * @returns {Function} Express middleware function
 */
const requireRole = (allowedRoles) => {
    return async (req, res, next) => {
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


            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();

            let userRole = ROLES.PASSENGER;

            if (profile && profile.role) {
                userRole = normalizeRole(profile.role);
            } else {

                console.warn(`Profile not found for user ${user.id}, falling back to metadata`);
                userRole = normalizeRole(user.user_metadata?.role || ROLES.PASSENGER);
            }


            const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

            console.log(`[Middleware] User: ${user.email}, Role: ${userRole}, Required: ${rolesArray}`);


            if (!rolesArray.includes(userRole)) {
                return res.status(403).json({
                    error: 'Insufficient permissions',
                    required: rolesArray,
                    current: userRole
                });
            }


            req.user = user;
            req.userRole = userRole;
            next();
        } catch (err) {
            console.error('Role middleware error:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
};


/**
 * Middleware requiring Admin role.
 * @constant
 */
const requireAdmin = requireRole(ROLES.ADMIN);


/**
 * Middleware requiring Admin or Conductor role.
 * @constant
 */
const requireAdminOrConductor = requireRole([ROLES.ADMIN, ROLES.CONDUCTOR]);


/**
 * Middleware requiring any valid role (Passenger, Admin, Conductor).
 * @constant
 */
const requireAnyRole = requireRole([ROLES.PASSENGER, ROLES.ADMIN, ROLES.CONDUCTOR]);

module.exports = {
    requireRole,
    requireAdmin,
    requireAdminOrConductor,
    requireAnyRole,
    ROLES,
    normalizeRole
};
