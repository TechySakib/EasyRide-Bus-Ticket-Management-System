'use server'

/**
 * Server action to log the current user's role for debugging purposes.
 * @param {string} role - The role to log.
 * @returns {Promise<void>}
 */
export async function logUserRole(role) {
    console.log("----------------------------------------")
    console.log(`[Dashboard] Current User Role: ${role}`)
    console.log("----------------------------------------")
}
