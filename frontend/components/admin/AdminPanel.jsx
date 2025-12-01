"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { UserCog, UserPlus, Users, BarChart3, ChevronDown, UsersRound } from "lucide-react"
import CreateUserDialog from "./CreateUserDialog"
import UserManagementDialog from "./UserManagementDialog"

export default function AdminPanel() {
    const router = useRouter()
    const [isOpen, setIsOpen] = useState(false)
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [showUserManagement, setShowUserManagement] = useState(false)

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
                        {}
                        <div
                            className="fixed inset-0 z-10"
                            onClick={() => setIsOpen(false)}
                        />

                        {}
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
                                        alert('Reports feature coming soon!')
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

            {}
            <CreateUserDialog
                isOpen={showCreateDialog}
                onClose={() => setShowCreateDialog(false)}
                onUserCreated={(user) => {
                    console.log('User created:', user)
                }}
            />

            {}
            <UserManagementDialog
                isOpen={showUserManagement}
                onClose={() => setShowUserManagement(false)}
            />
        </>
    )
}
