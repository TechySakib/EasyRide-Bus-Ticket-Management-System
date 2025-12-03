import { supabase } from "@/lib/supabase"

const API_URL = 'http://localhost:5000/api/users';


export const UserService = {

    /**
     * Creates a new user via the backend API.
     * @param {Object} userData - The user data to create.
     * @param {string} userData.email - User's email.
     * @param {string} userData.password - User's password.
     * @param {string} userData.role - User's role.
     * @param {string} [userData.name] - User's full name.
     * @param {string} [userData.phone] - User's phone number.
     * @param {string} [userData.studentId] - User's student ID (if applicable).
     * @returns {Promise<Object>} The created user data.
     * @throws {Error} If authentication fails or the API returns an error.
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
     * Lists all users from the backend API.
     * @returns {Promise<Array<Object>>} The list of users.
     * @throws {Error} If authentication fails or the API returns an error.
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
     * Updates a user's role via the backend API.
     * @param {string} userId - The ID of the user to update.
     * @param {string} newRole - The new role to assign.
     * @returns {Promise<Object>} The response data.
     * @throws {Error} If authentication fails or the API returns an error.
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
