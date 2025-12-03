/**
 * Roles Library
 * Defines user roles and helper functions for role management.
 * @module lib/roles
 */

/**
 * User Roles Enum
 * @readonly
 * @enum {string}
 */
export const ROLES = {
    PASSENGER: 'passenger',
    ADMIN: 'admin',
    CONDUCTOR: 'conductor',
    STUDENT: 'student'
};


/**
 * Role Configuration Object
 * Contains display labels, colors, and descriptions for each role.
 * @constant
 * @type {Object.<string, {label: string, color: string, description: string}>}
 */
export const ROLE_CONFIG = {
    [ROLES.PASSENGER]: {
        label: 'Passenger',
        color: 'blue',
        description: 'Regular bus passenger'
    },
    [ROLES.CONDUCTOR]: {
        label: 'Conductor',
        color: 'green',
        description: 'Bus conductor with ticket management access'
    },
    [ROLES.ADMIN]: {
        label: 'Admin',
        color: 'purple',
        description: 'System administrator with full access'
    },
    [ROLES.STUDENT]: {
        label: 'Passenger',
        color: 'blue',
        description: 'Regular bus passenger'
    }
};


/**
 * Normalizes a user role string.
 * Maps 'student' to 'passenger'.
 * 
 * @function normalizeRole
 * @param {string} role - The role to normalize
 * @returns {string} The normalized role
 */
export const normalizeRole = (role) => {
    if (role === ROLES.STUDENT) {
        return ROLES.PASSENGER;
    }
    return role;
};


/**
 * Checks if a user is an Admin.
 * 
 * @function isAdmin
 * @param {Object} user - The user object
 * @returns {boolean} True if user is admin
 */
export const isAdmin = (user) => {
    if (!user) return false;
    const role = user.user_metadata?.role;
    return role === ROLES.ADMIN;
};


/**
 * Checks if a user is a Conductor.
 * 
 * @function isConductor
 * @param {Object} user - The user object
 * @returns {boolean} True if user is conductor
 */
export const isConductor = (user) => {
    if (!user) return false;
    const role = user.user_metadata?.role;
    return role === ROLES.CONDUCTOR;
};


/**
 * Checks if a user is a Passenger.
 * 
 * @function isPassenger
 * @param {Object} user - The user object
 * @returns {boolean} True if user is passenger
 */
export const isPassenger = (user) => {
    if (!user) return false;
    const role = normalizeRole(user.user_metadata?.role || ROLES.PASSENGER);
    return role === ROLES.PASSENGER;
};


/**
 * Gets the normalized role of a user.
 * 
 * @function getUserRole
 * @param {Object} user - The user object
 * @returns {string} The user's role
 */
export const getUserRole = (user) => {
    if (!user) return ROLES.PASSENGER;
    return normalizeRole(user.user_metadata?.role || ROLES.PASSENGER);
};


/**
 * Gets the display label for a role.
 * 
 * @function getRoleLabel
 * @param {string} role - The role
 * @returns {string} The display label
 */
export const getRoleLabel = (role) => {
    const normalizedRole = normalizeRole(role);
    return ROLE_CONFIG[normalizedRole]?.label || 'Passenger';
};


/**
 * Gets the color associated with a role.
 * 
 * @function getRoleColor
 * @param {string} role - The role
 * @returns {string} The color string
 */
export const getRoleColor = (role) => {
    const normalizedRole = normalizeRole(role);
    return ROLE_CONFIG[normalizedRole]?.color || 'blue';
};


/**
 * Checks if a user has a staff role (Admin or Conductor).
 * 
 * @function hasStaffRole
 * @param {Object} user - The user object
 * @returns {boolean} True if user is staff
 */
export const hasStaffRole = (user) => {
    return isAdmin(user) || isConductor(user);
};
