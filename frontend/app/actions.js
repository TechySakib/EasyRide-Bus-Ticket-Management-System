'use server'

/**
 * Logs the current user's role to the server console.
 * Useful for debugging role-based access control.
 * 
 * @param {string} role - The user role to log
 * @returns {Promise<void>}
 */
export async function logUserRole(role) {
    console.log("----------------------------------------")
    console.log(`[Dashboard] Current User Role: ${role}`)
    console.log("----------------------------------------")
}
