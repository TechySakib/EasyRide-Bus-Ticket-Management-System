"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    Bus,
    Bell,
    User,
    Shield,
    ChevronDown,
    Lock,
    LogOut,
    UserCircle,
    UserPlus,
    QrCode
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import AdminPanel from "@/components/admin/AdminPanel"
import ChangePasswordDialog from "@/components/user/ChangePasswordDialog"
import UserProfileDialog from "@/components/user/UserProfileDialog"
import { getUserRole, getRoleLabel, getRoleColor, ROLES } from "@/lib/roles"
import { logUserRole } from "@/app/actions"

/**
 * Dashboard Header Component
 * Displays the main navigation, user profile menu, and admin controls.
 * Handles user role checking and dynamic menu rendering.
 * 
 * @component
 * @returns {JSX.Element} The rendered header component
 */
export default function DashboardHeader() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [userRole, setUserRole] = useState(null)
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showPasswordDialog, setShowPasswordDialog] = useState(false)
    const [showProfileDialog, setShowProfileDialog] = useState(false)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                setUser(session.user)

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single()

                if (profile?.role) {
                    setUserRole(profile.role)
                    logUserRole(profile.role)
                } else {
                    const role = getUserRole(session.user)
                    setUserRole(role)
                    logUserRole(role)
                }
            }
        }

        checkUser()
    }, [])

    return (
        <>
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <div className="bg-blue-600 p-1.5 rounded-lg">
                                <Bus className="h-6 w-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-blue-600">EasyRide</span>
                        </div>

                        <nav className="hidden md:flex items-center space-x-8">
                            <Link href="/dashboard" className="text-gray-900 font-medium hover:text-blue-600 transition-colors">
                                Book Ticket
                            </Link>
                            <Link href="/bookings" className="text-gray-500 font-medium hover:text-blue-600 transition-colors">
                                My Bookings
                            </Link>
                            <Link href="/subscriptions" className="text-gray-500 font-medium hover:text-blue-600 transition-colors">
                                Subscriptions
                            </Link>
                            <Link href="/track" className="text-gray-500 font-medium hover:text-blue-600 transition-colors">
                                Track Bus
                            </Link>
                            <Link href="/dashboard/scan" className="text-gray-500 font-medium hover:text-blue-600 transition-colors flex items-center gap-2">
                                <QrCode className="h-4 w-4" />
                                QR Scanner
                            </Link>
                            {userRole === ROLES.ADMIN && (
                                <Link href="/dashboard/create-user" className="text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    Add User
                                </Link>
                            )}
                        </nav>

                        <div className="flex items-center gap-4">
                            {userRole === ROLES.ADMIN && (
                                <AdminPanel />
                            )}

                            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <Bell className="h-6 w-6" />
                                <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-emerald-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
                                    3
                                </span>
                            </button>

                            <div className="relative">
                                <div
                                    className="flex items-center gap-2 cursor-pointer"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                >
                                    <div className="text-right hidden sm:block">
                                        <div className="text-sm font-medium text-gray-900">
                                            {user?.user_metadata?.full_name || 'User'}
                                        </div>
                                        <div className="flex items-center gap-1 justify-end">
                                            <Shield className={`h-3 w-3 text-${getRoleColor(userRole)}-600`} />
                                            <div className={`text-xs font-medium text-${getRoleColor(userRole)}-600`}>
                                                {getRoleLabel(userRole)}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-300 transition-colors">
                                        <User className="h-5 w-5" />
                                    </div>
                                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                                </div>

                                {showUserMenu && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-40"
                                            onClick={() => setShowUserMenu(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                            <button
                                                onClick={() => {
                                                    setShowUserMenu(false)
                                                    setShowProfileDialog(true)
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                            >
                                                <UserCircle className="h-4 w-4 text-gray-500" />
                                                My Profile
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowUserMenu(false)
                                                    router.push('/dashboard/scan')
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                            >
                                                <QrCode className="h-4 w-4 text-gray-500" />
                                                QR Code
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setShowUserMenu(false)
                                                    setShowPasswordDialog(true)
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                            >
                                                <Lock className="h-4 w-4 text-gray-500" />
                                                Change Password
                                            </button>
                                            <div className="border-t border-gray-100 my-1" />
                                            <button
                                                onClick={async () => {
                                                    await supabase.auth.signOut()
                                                    router.push("/")
                                                }}
                                                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <ChangePasswordDialog
                isOpen={showPasswordDialog}
                onClose={() => setShowPasswordDialog(false)}
            />

            <UserProfileDialog
                isOpen={showProfileDialog}
                onClose={() => setShowProfileDialog(false)}
            />
        </>
    )
}
