"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserCog, UserPlus, Users, BarChart3, ChevronDown, UsersRound, MapPin, Bus } from "lucide-react"
import CreateUserDialog from "./CreateUserDialog"
import CreateRouteDialog from "./CreateRouteDialog"
import UserManagementDialog from "./UserManagementDialog"
import ManageAssignmentsDialog from "./ManageAssignmentsDialog"
import AdminTicketPanel from "./AdminTicketPanel"

export default function AdminPanel() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showCreateRouteDialog, setShowCreateRouteDialog] = useState(false)
    const [showUserManagement, setShowUserManagement] = useState(false)
    const [showTicketsPanel, setShowTicketsPanel] = useState(false)
    const [showAssignmentsDialog, setShowAssignmentsDialog] = useState(false)

    return (
        <>
            <div className="relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md"
                >
                    <UserCog className="h-5 w-5" />
                    <span className="font-medium">Admin Panel</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Dropdown Menu */}
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-100 overflow-hidden z-20">
                            <div className="p-2">
                                <button
                                    onClick={() => {
                                        setShowCreateDialog(true)
                                        setIsOpen(false)
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-purple-50 rounded-lg transition-colors group"
                                >
                                    <div className="bg-purple-100 p-2 rounded-lg group-hover:bg-purple-200 transition-colors">
                                        <UserPlus className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">Create User</div>
                                        <div className="text-xs text-gray-500">Add new user account</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setShowCreateRouteDialog(true)
                                        setIsOpen(false)
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-orange-50 rounded-lg transition-colors group"
                                >
                                    <div className="bg-orange-100 p-2 rounded-lg group-hover:bg-orange-200 transition-colors">
                                        <MapPin className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">Create Route</div>
                                        <div className="text-xs text-gray-500">Add new bus route</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setShowAssignmentsDialog(true)
                                        setIsOpen(false)
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-cyan-50 rounded-lg transition-colors group"
                                >
                                    <div className="bg-cyan-100 p-2 rounded-lg group-hover:bg-cyan-200 transition-colors">
                                        <Bus className="h-5 w-5 text-cyan-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">Assign Conductors</div>
                                        <div className="text-xs text-gray-500">Manage bus staff</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setShowUserManagement(true)
                                        setIsOpen(false)
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 rounded-lg transition-colors group"
                                >
                                    <div className="bg-blue-100 p-2 rounded-lg group-hover:bg-blue-200 transition-colors">
                                        <Users className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">Manage Users</div>
                                        <div className="text-xs text-gray-500">View and edit users</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        router.push('/dashboard/users')
                                        setIsOpen(false)
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-indigo-50 rounded-lg transition-colors group"
                                >
                                    <div className="bg-indigo-100 p-2 rounded-lg group-hover:bg-indigo-200 transition-colors">
                                        <UsersRound className="h-5 w-5 text-indigo-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">View All Users</div>
                                        <div className="text-xs text-gray-500">Full page user list</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => {
                                        setShowTicketsPanel(true)
                                        setIsOpen(false)
                                    }}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50 rounded-lg transition-colors group"
                                >
                                    <div className="bg-emerald-100 p-2 rounded-lg group-hover:bg-emerald-200 transition-colors">
                                        <BarChart3 className="h-5 w-5 text-emerald-600" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">View Reports</div>
                                        <div className="text-xs text-gray-500">Analytics and insights</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Create User Dialog */}
            <CreateUserDialog
                isOpen={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                onUserCreated={(user) => {
                    console.log('User created:', user)
                }}
            />

            {/* Create Route Dialog */}
            <CreateRouteDialog
                isOpen={showCreateRouteDialog}
                onClose={() => setShowCreateRouteDialog(false)}
                onRouteCreated={() => {
                    window.location.reload()
                }}
            />

            {/* Manage Assignments Dialog */}
            <ManageAssignmentsDialog
                isOpen={showAssignmentsDialog}
                onClose={() => setShowAssignmentsDialog(false)}
            />

            {/* User Management Dialog */}
            <UserManagementDialog
                isOpen={showUserManagement}
                onClose={() => setShowUserManagement(false)}
            />

            {/* Admin Ticket Panel */}
            <AdminTicketPanel
                isOpen={showTicketsPanel}
                onClose={() => setShowTicketsPanel(false)}
            />
        </>
    )
}
