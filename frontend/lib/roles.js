
/**
 * Enum for user roles.
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
 * Configuration for role display properties.
 * Maps roles to their label, color, and description.
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
 * Normalizes a role string.
 * Converts 'student' to 'passenger'.
 * @param {string} role - The role to normalize.
 * @returns {string} The normalized role.
 */
export const normalizeRole = (role) => {
    if (role === ROLES.STUDENT) {
        return ROLES.PASSENGER;
    }
    return role;
};


/**
 * Checks if a user is an admin.
 * @param {Object} user - The user object.
 * @returns {boolean} True if the user is an admin, false otherwise.
 */
export const isAdmin = (user) => {
    if (!user) return false;
    const role = user.user_metadata?.role;
    return role === ROLES.ADMIN;
};


/**
 * Checks if a user is a conductor.
 * @param {Object} user - The user object.
 * @returns {boolean} True if the user is a conductor, false otherwise.
 */
export const isConductor = (user) => {
    if (!user) return false;
    const role = user.user_metadata?.role;
    return role === ROLES.CONDUCTOR;
};


/**
 * Checks if a user is a passenger.
 * @param {Object} user - The user object.
 * @returns {boolean} True if the user is a passenger, false otherwise.
 */
export const isPassenger = (user) => {
    if (!user) return false;
    const role = normalizeRole(user.user_metadata?.role || ROLES.PASSENGER);
    return role === ROLES.PASSENGER;
};


/**
 * Gets the normalized role of a user.
 * @param {Object} user - The user object.
 * @returns {string} The normalized role.
 */
export const getUserRole = (user) => {
    if (!user) return ROLES.PASSENGER;
    return normalizeRole(user.user_metadata?.role || ROLES.PASSENGER);
};


/**
 * Gets the display label for a role.
 * @param {string} role - The role string.
 * @returns {string} The display label.
 */
export const getRoleLabel = (role) => {
    const normalizedRole = normalizeRole(role);
    return ROLE_CONFIG[normalizedRole]?.label || 'Passenger';
};


/**
 * Gets the color associated with a role.
 * @param {string} role - The role string.
 * @returns {string} The color string.
 */
export const getRoleColor = (role) => {
    const normalizedRole = normalizeRole(role);
    return ROLE_CONFIG[normalizedRole]?.color || 'blue';
};


/**
 * Checks if a user has a staff role (Admin or Conductor).
 * @param {Object} user - The user object.
 * @returns {boolean} True if the user is staff, false otherwise.
 */
export const hasStaffRole = (user) => {
    return isAdmin(user) || isConductor(user);
};
