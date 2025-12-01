"use client"

import { useState, useEffect } from "react"
import { X, Search, Users, Shield, Mail, Phone, Calendar, Clock } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getRoleLabel, getRoleColor } from "@/lib/roles"
import UserDetailDialog from "./UserDetailDialog"

export default function UserManagementDialog({ isOpen, onClose }) {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedUser, setSelectedUser] = useState(null)

    useEffect(() => {
        if (isOpen) {
            fetchUsers()
        }
    }, [isOpen])

    const fetchUsers = async () => {
        setLoading(true)
        setError(null)

        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                setError("Not authenticated")
                return
            }

            const response = await fetch('http://localhost:5000/api/users/list', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (!response.ok) {
                throw new Error('Failed to fetch users')
            }

            const data = await response.json()
            setUsers(data.users || [])
        } catch (err) {
            console.error('Error fetching users:', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase()
        return (
            user.name?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.phone?.includes(query)
        )
    })

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        })
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Never'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (!isOpen) return null

    return (
        <>
            {}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
                onClick={onClose}
            />

            {}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col pointer-events-auto animate-slideUp"
                    onClick={(e) => e.stopPropagation()}
                >
                    {}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-100 p-2.5 rounded-lg">
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                                <p className="text-sm text-gray-500">View and search all registered users</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-6 w-6 text-gray-500" />
                        </button>
                    </div>

                    {}
                    <div className="p-6 border-b border-gray-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name, email, or phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div className="mt-2 text-sm text-gray-500">
                            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
                        </div>
                    </div>

                    {}
                    <div className="flex-1 overflow-auto p-6">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                <p className="text-gray-500">Loading users...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-4">
                                    <p className="font-medium">Error loading users</p>
                                    <p className="text-sm">{error}</p>
                                </div>
                                <button
                                    onClick={fetchUsers}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : filteredUsers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Users className="h-16 w-16 text-gray-300 mb-4" />
                                <p className="text-gray-500 text-lg">No users found</p>
                                <p className="text-gray-400 text-sm">Try adjusting your search</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-gray-200">
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                User
                                            </th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                Contact
                                            </th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                Role
                                            </th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                Created
                                            </th>
                                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                                                Last Sign In
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.map((user) => {
                                            const roleColor = getRoleColor(user.role)
                                            const roleLabel = getRoleLabel(user.role)

                                            return (
                                                <tr
                                                    key={user.id}
                                                    onClick={() => setSelectedUser(user)}
                                                    className="border-b border-gray-100 hover:bg-blue-50 transition-colors cursor-pointer"
                                                >
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                                                                {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-medium text-gray-900">
                                                                    {user.name || 'No name'}
                                                                </div>
                                                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                                                    <Mail className="h-3 w-3" />
                                                                    {user.email}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                            <Phone className="h-4 w-4" />
                                                            {user.phone || 'N/A'}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-${roleColor}-100 text-${roleColor}-700`}>
                                                            <Shield className="h-3 w-3" />
                                                            {roleLabel}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                            <Calendar className="h-4 w-4" />
                                                            {formatDate(user.created_at)}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4">
                                                        <div className="flex items-center gap-1 text-sm text-gray-600">
                                                            <Clock className="h-4 w-4" />
                                                            {formatDateTime(user.last_sign_in)}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {}
                    <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-gray-500">
                                Total users: <span className="font-semibold text-gray-700">{users.length}</span>
                            </p>
                            <button
                                onClick={onClose}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {}
            <UserDetailDialog
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                user={selectedUser}
                onUserUpdated={fetchUsers}
            />

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </>
    )
}
