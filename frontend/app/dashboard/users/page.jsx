"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    Bus,
    Bell,
    User,
    Search,
    Shield,
    Mail,
    Phone,
    Calendar,
    Clock,
    ArrowLeft,
    Users,
    Filter,
    Download,
    RefreshCw
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { isAdmin, getUserRole, getRoleLabel, getRoleColor } from "@/lib/roles"
import UserDetailDialog from "@/components/admin/UserDetailDialog"

/**
 * AllUsersPage component.
 * A page for admins to view and manage all registered users.
 * Provides search, filtering, and detailed user views.
 * @returns {JSX.Element|null} The rendered all users page or null if loading/unauthenticated.
 */
export default function AllUsersPage() {
    const router = useRouter()
    const [currentUser, setCurrentUser] = useState(null)
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [fetchingUsers, setFetchingUsers] = useState(false)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [roleFilter, setRoleFilter] = useState("all")
    const [selectedUser, setSelectedUser] = useState(null)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push("/")
                return
            }


            if (!isAdmin(session.user)) {
                router.push("/dashboard")
                return
            }

            setCurrentUser(session.user)
            setLoading(false)
        }

        checkUser()
    }, [router])

    useEffect(() => {
        if (currentUser) {
            fetchUsers()
        }
    }, [currentUser])

    const fetchUsers = async () => {
        setFetchingUsers(true)
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
            setFetchingUsers(false)
        }
    }

    const filteredUsers = users.filter(user => {
        const query = searchQuery.toLowerCase()
        const matchesSearch = (
            user.name?.toLowerCase().includes(query) ||
            user.email?.toLowerCase().includes(query) ||
            user.phone?.includes(query)
        )

        const matchesRole = roleFilter === "all" || user.role === roleFilter

        return matchesSearch && matchesRole
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

    const getRoleStats = () => {
        const stats = {
            total: users.length,
            admin: users.filter(u => u.role === 'admin').length,
            conductor: users.filter(u => u.role === 'conductor').length,
            passenger: users.filter(u => u.role === 'passenger').length,
        }
        return stats
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!currentUser) return null

    const stats = getRoleStats()

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            { }
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                <ArrowLeft className="h-6 w-6 text-gray-600" />
                            </Link>
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-600 p-1.5 rounded-lg">
                                    <Bus className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xl font-bold text-blue-600">EasyRide</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <Bell className="h-6 w-6" />
                                <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-emerald-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
                                    3
                                </span>
                            </button>

                            { }
                            <div className="flex items-center gap-2">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-medium text-gray-900">
                                        {currentUser?.user_metadata?.full_name || 'Admin'}
                                    </div>
                                    <div className="flex items-center gap-1 justify-end">
                                        <Shield className={`h-3 w-3 text-${getRoleColor(getUserRole(currentUser))}-600`} />
                                        <div className={`text-xs font-medium text-${getRoleColor(getUserRole(currentUser))}-600`}>
                                            {getRoleLabel(getUserRole(currentUser))}
                                        </div>
                                    </div>
                                </div>
                                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 cursor-pointer transition-colors">
                                    <User className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                { }
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-100 p-3 rounded-xl">
                            <Users className="h-8 w-8 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">All Users</h1>
                            <p className="text-gray-500">Manage and view all registered users</p>
                        </div>
                    </div>

                    { }
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <StatsCard
                            title="Total Users"
                            value={stats.total}
                            color="blue"
                            icon={<Users className="h-5 w-5" />}
                        />
                        <StatsCard
                            title="Admins"
                            value={stats.admin}
                            color="purple"
                            icon={<Shield className="h-5 w-5" />}
                        />
                        <StatsCard
                            title="Conductors"
                            value={stats.conductor}
                            color="emerald"
                            icon={<Shield className="h-5 w-5" />}
                        />
                        <StatsCard
                            title="Passengers"
                            value={stats.passenger}
                            color="orange"
                            icon={<Shield className="h-5 w-5" />}
                        />
                    </div>
                </div>

                { }
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        { }
                        <div className="md:col-span-2">
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
                        </div>

                        { }
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none cursor-pointer"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="conductor">Conductor</option>
                                <option value="passenger">Passenger</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <p className="text-sm text-gray-500">
                            Showing {filteredUsers.length} of {users.length} users
                        </p>
                        <button
                            onClick={fetchUsers}
                            disabled={fetchingUsers}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${fetchingUsers ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>

                { }
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {fetchingUsers && !users.length ? (
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
                            <p className="text-gray-400 text-sm">Try adjusting your search or filters</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                                            User
                                        </th>
                                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                                            Contact
                                        </th>
                                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                                            Role
                                        </th>
                                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                                            Created
                                        </th>
                                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                                            Last Sign In
                                        </th>
                                        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">
                                            User ID
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
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                                                            {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="font-medium text-gray-900 truncate">
                                                                {user.name || 'No name'}
                                                            </div>
                                                            <div className="text-sm text-gray-500 flex items-center gap-1 truncate">
                                                                <Mail className="h-3 w-3 flex-shrink-0" />
                                                                <span className="truncate">{user.email}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-1 text-sm text-gray-600">
                                                        <Phone className="h-4 w-4 flex-shrink-0" />
                                                        {user.phone || 'N/A'}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-${roleColor}-100 text-${roleColor}-700 whitespace-nowrap`}>
                                                        <Shield className="h-3 w-3" />
                                                        {roleLabel}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap">
                                                        <Calendar className="h-4 w-4 flex-shrink-0" />
                                                        {formatDate(user.created_at)}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap">
                                                        <Clock className="h-4 w-4 flex-shrink-0" />
                                                        {formatDateTime(user.last_sign_in)}
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="text-xs text-gray-400 font-mono">
                                                        {user.id.substring(0, 8)}...
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
            </main>

            { }
            <UserDetailDialog
                isOpen={!!selectedUser}
                onClose={() => setSelectedUser(null)}
                user={selectedUser}
            />
        </div>
    )
}

/**
 * StatsCard component.
 * Renders a card displaying a statistic with an icon and value.
 * @param {Object} props - The component props.
 * @param {string} props.title - The title of the statistic.
 * @param {number|string} props.value - The value to display.
 * @param {string} props.color - The color theme for the card.
 * @param {React.ReactNode} props.icon - The icon to display.
 * @returns {JSX.Element} The rendered stats card.
 */
function StatsCard({ title, value, color, icon }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                </div>
                <div className={`bg-${color}-100 p-3 rounded-lg`}>
                    <div className={`text-${color}-600`}>
                        {icon}
                    </div>
                </div>
            </div>
        </div>
    )
}
