
export const ROLES = {
    PASSENGER: 'passenger',
    ADMIN: 'admin',
    CONDUCTOR: 'conductor',
    STUDENT: 'student' 
};


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


export const normalizeRole = (role) => {
    if (role === ROLES.STUDENT) {
        return ROLES.PASSENGER;
    }
    return role;
};


export const isAdmin = (user) => {
    if (!user) return false;
    const role = user.user_metadata?.role;
    return role === ROLES.ADMIN;
};


export const isConductor = (user) => {
    if (!user) return false;
    const role = user.user_metadata?.role;
    return role === ROLES.CONDUCTOR;
};


export const isPassenger = (user) => {
    if (!user) return false;
    const role = normalizeRole(user.user_metadata?.role || ROLES.PASSENGER);
    return role === ROLES.PASSENGER;
};


export const getUserRole = (user) => {
    if (!user) return ROLES.PASSENGER;
    return normalizeRole(user.user_metadata?.role || ROLES.PASSENGER);
};


export const getRoleLabel = (role) => {
    const normalizedRole = normalizeRole(role);
    return ROLE_CONFIG[normalizedRole]?.label || 'Passenger';
};


export const getRoleColor = (role) => {
    const normalizedRole = normalizeRole(role);
    return ROLE_CONFIG[normalizedRole]?.color || 'blue';
};


export const hasStaffRole = (user) => {
    return isAdmin(user) || isConductor(user);
};
