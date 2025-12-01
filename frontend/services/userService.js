import { supabase } from "@/lib/supabase"

const API_URL = 'http://localhost:5000/api/users';


export const UserService = {
    
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
