import { supabase } from "@/lib/supabase"

const API_URL = 'http://localhost:5000/api/users';

/**
 * User Service
 * Handles user-related API calls to the backend.
 * @namespace UserService
 */
export const UserService = {

    /**
     * Creates a new user.
     * 
     * @async
     * @function createUser
     * @memberof UserService
     * @param {Object} userData - User data object
     * @param {string} userData.email - User email
     * @param {string} userData.password - User password
     * @param {string} userData.role - User role
     * @param {string} [userData.name] - User full name
     * @param {string} [userData.phone] - User phone number
     * @param {string} [userData.studentId] - Student ID
     * @returns {Promise<Object>} Created user data
     * @throws {Error} If authentication fails or API returns error
     */
    createUser: async (userData) => {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            throw new Error("Not authenticated")
        }

        const response = await fetch(`${API_URL}/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify(userData)
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || "Failed to create user")
        }

        return data;
    },


    /**
     * Lists all users.
     * 
     * @async
     * @function listUsers
     * @memberof UserService
     * @returns {Promise<Array>} List of users
     * @throws {Error} If authentication fails or API returns error
     */
    listUsers: async () => {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            throw new Error("Not authenticated")
        }

        const response = await fetch(`${API_URL}/list`, {
            headers: {
                'Authorization': `Bearer ${session.access_token}`,
                'Content-Type': 'application/json'
            }
        })

        if (!response.ok) {
            throw new Error('Failed to fetch users')
        }

        const data = await response.json()
        return data.users || [];
    },


    /**
     * Updates a user's role.
     * 
     * @async
     * @function updateRole
     * @memberof UserService
     * @param {string} userId - ID of the user to update
     * @param {string} newRole - New role to assign
     * @returns {Promise<Object>} Response data
     * @throws {Error} If authentication fails or API returns error
     */
    updateRole: async (userId, newRole) => {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
            throw new Error("Not authenticated")
        }

        const response = await fetch(`${API_URL}/update-role`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`
            },
            body: JSON.stringify({ userId, newRole })
        })

        const data = await response.json()

        if (!response.ok) {
            throw new Error(data.error || 'Failed to update role')
        }

        return data;
    }
};
