"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
    Bus,
    Bell,
    User,
    MapPin,
    Calendar,
    Search,
    Clock,
    CreditCard,
    BadgePercent,
    CalendarDays,
    MessageCircle,
    HelpCircle,
    Shield,
    ChevronDown,
    Lock,
    LogOut,
    UserCircle,
    UserPlus
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import AdminPanel from "@/components/admin/AdminPanel"
import ChangePasswordDialog from "@/components/user/ChangePasswordDialog"
import UserProfileDialog from "@/components/user/UserProfileDialog"
import ReportIssueModal from "@/components/user/ReportIssueModal"
import MyIssuesDialog from "@/components/user/MyIssuesDialog"
import { isAdmin, getUserRole, getRoleLabel, getRoleColor, ROLES } from "@/lib/roles"
import { logUserRole } from "../actions"
import ConductorDashboard from "@/components/conductor/ConductorDashboard"
import ChatBox from "@/components/chat/ChatBox"

/**
 * Dashboard Page
 * Main landing page for authenticated users.
 * Displays user stats, booking options, and access to other features.
 * 
 * @component
 * @returns {JSX.Element} Dashboard UI
 */
export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [userRole, setUserRole] = useState(null)
    const [loading, setLoading] = useState(true)
    const [direction, setDirection] = useState('to_nsu')
    const [locations, setLocations] = useState([])
    const [selectedLocation, setSelectedLocation] = useState("")
    const [showUserMenu, setShowUserMenu] = useState(false)
    const [showPasswordDialog, setShowPasswordDialog] = useState(false)
    const [showProfileDialog, setShowProfileDialog] = useState(false)
    const [showReportIssue, setShowReportIssue] = useState(false)
    const [showMyIssues, setShowMyIssues] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [dateRange, setDateRange] = useState({ min: '', max: '' })

    useEffect(() => {
        const today = new Date()
        const max = new Date()
        max.setDate(today.getDate() + 6)

        // Format as YYYY-MM-DD using local time to avoid timezone issues
        const formatDate = (date) => {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            return `${year}-${month}-${day}`
        }

        setDateRange({
            min: formatDate(today),
            max: formatDate(max)
        })
    }, [])

    useEffect(() => {
        const fetchLocations = async () => {
            const { data, error } = await supabase
                .from('locations')
                .select('name')
                .order('name')

            if (data) {
                setLocations(data)
            }
        }
        fetchLocations()
    }, [])

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push("/")
            } else {
                setUser(session.user)


                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single()

                if (profile?.role) {
                    setUserRole(profile.role)
                    console.log("User Role:", profile.role)
                    logUserRole(profile.role)
                } else {

                    const role = getUserRole(session.user)
                    setUserRole(role)
                    console.log("User Role:", role)
                    logUserRole(role)
                }
            }
            setLoading(false)
        }

        checkUser()
    }, [router])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    if (!user) return null

    if (userRole === 'conductor') {
        return (
            <div className="min-h-screen bg-slate-50 font-sans">
                <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-600 p-1.5 rounded-lg">
                                    <Bus className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xl font-bold text-blue-600">EasyRide</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right hidden sm:block">
                                    <div className="text-sm font-medium text-gray-900">
                                        {user?.user_metadata?.full_name || 'Conductor'}
                                    </div>
                                    <div className="text-xs font-medium text-blue-600">
                                        Conductor
                                    </div>
                                </div>
                                <button
                                    onClick={async () => {
                                        await supabase.auth.signOut()
                                        router.push("/")
                                    }}
                                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <LogOut className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <ConductorDashboard user={user} />
                </main>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            { }
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
                            {userRole === ROLES.ADMIN && (
                                <Link href="/dashboard/create-user" className="text-blue-600 font-medium hover:text-blue-700 transition-colors flex items-center gap-2">
                                    <UserPlus className="h-4 w-4" />
                                    Add User
                                </Link>
                            )}
                        </nav>

                        <div className="flex items-center gap-4">
                            { }
                            {userRole === ROLES.ADMIN && (
                                <AdminPanel />
                            )}

                            <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <Bell className="h-6 w-6" />
                                <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-emerald-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-white">
                                    3
                                </span>
                            </button>

                            { }
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

                                { }
                                {showUserMenu && (
                                    <>
                                        { }
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
                                            {userRole !== ROLES.ADMIN && (
                                                <button
                                                    onClick={() => {
                                                        setShowUserMenu(false)
                                                        setShowMyIssues(true)
                                                    }}
                                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                                                >
                                                    <HelpCircle className="h-4 w-4 text-gray-500" />
                                                    My Issues
                                                </button>
                                            )}
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

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                { }
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
                    <div className="space-y-8">
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-4">
                                Your Journey, <span className="text-blue-600">Simplified</span>
                            </h1>
                            <p className="text-lg text-gray-600 max-w-lg">
                                Book bus tickets instantly, track in real-time, and travel hassle-free with EasyRide's smart ticket management system.
                            </p>
                        </div>

                        {/* Search Form */}
                        <Card className="p-6 shadow-xl border-0 bg-white rounded-2xl">
                            {/* Direction Toggle */}
                            <div className="flex bg-gray-100 p-1 rounded-lg mb-6 w-fit">
                                <button
                                    onClick={() => {
                                        setDirection('to_nsu')
                                        setSelectedLocation("")
                                    }}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${direction === 'to_nsu'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    To Campus
                                </button>
                                <button
                                    onClick={() => {
                                        setDirection('from_nsu')
                                        setSelectedLocation("")
                                    }}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${direction === 'from_nsu'
                                        ? 'bg-white text-blue-600 shadow-sm'
                                        : 'text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    From Campus
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">From</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        {direction === 'to_nsu' ? (
                                            <select
                                                className="pl-10 h-12 w-full rounded-md border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all appearance-none"
                                                value={selectedLocation}
                                                onChange={(e) => setSelectedLocation(e.target.value)}
                                            >
                                                <option value="">Select Location</option>
                                                {locations.map((loc) => (
                                                    <option key={loc.name} value={loc.name}>{loc.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <Input
                                                value="North South University"
                                                readOnly
                                                className="pl-10 h-12 border-gray-200 bg-gray-100 text-gray-600"
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">To</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        {direction === 'from_nsu' ? (
                                            <select
                                                className="pl-10 h-12 w-full rounded-md border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all appearance-none"
                                                value={selectedLocation}
                                                onChange={(e) => setSelectedLocation(e.target.value)}
                                            >
                                                <option value="">Select Location</option>
                                                {locations.map((loc) => (
                                                    <option key={loc.name} value={loc.name}>{loc.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <Input
                                                value="North South University"
                                                readOnly
                                                className="pl-10 h-12 border-gray-200 bg-gray-100 text-gray-600"
                                            />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-500">Date</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                        <Input
                                            type="date"
                                            min={dateRange.min}
                                            max={dateRange.max}
                                            className="pl-10 h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                        />
                                    </div>
                                </div>
                                <Button className="h-12 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5">
                                    <Search className="mr-2 h-5 w-5" />
                                    Search Routes
                                </Button>
                            </div>
                        </Card>
                    </div>

                    <div className="relative h-[400px] lg:h-[500px] w-full rounded-3xl overflow-hidden shadow-2xl">
                        { }
                        <Image
                            src="/bus.png"
                            alt="University Bus"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                </div>

                { }
                <div className="text-center mb-16">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Why Choose EasyRide?</h2>
                    <p className="text-gray-500">Experience seamless bus travel with our modern features</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <FeatureCard
                        icon={<Clock className="h-6 w-6 text-blue-600" />}
                        title="Real-Time Tracking"
                        description="Track your bus location in real-time and never miss a ride."
                    />
                    <FeatureCard
                        icon={<CreditCard className="h-6 w-6 text-emerald-600" />}
                        title="Easy Payment"
                        description="Secure and fast digital payments for your daily commute."
                    />
                    <FeatureCard
                        icon={<BadgePercent className="h-6 w-6 text-purple-600" />}
                        title="Student Discounts"
                        description="Special fares and subscription plans for university students."
                    />
                    <FeatureCard
                        icon={<CalendarDays className="h-6 w-6 text-orange-600" />}
                        title="Flexible Booking"
                        description="Book in advance or on the go with our flexible scheduling."
                    />
                </div>
            </main>

            { }
            {userRole !== ROLES.ADMIN && (
                <div className="fixed bottom-6 right-6 flex items-end gap-2 z-50">
                    <button
                        onClick={() => setShowReportIssue(true)}
                        className="bg-red-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-red-700 transition-colors flex items-center gap-2 font-medium"
                    >
                        <HelpCircle className="h-5 w-5" />
                        <span>Report Issue</span>
                    </button>
                    <button
                        onClick={() => setShowChat(!showChat)}
                        className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition-transform hover:scale-110"
                    >
                        <MessageCircle className="h-6 w-6" />
                    </button>
                </div>
            )}

            { }
            <ChangePasswordDialog
                isOpen={showPasswordDialog}
                onClose={() => setShowPasswordDialog(false)}
            />

            { }
            <UserProfileDialog
                isOpen={showProfileDialog}
                onClose={() => setShowProfileDialog(false)}
            />

            <ReportIssueModal
                isOpen={showReportIssue}
                onClose={() => setShowReportIssue(false)}
            />

            <MyIssuesDialog
                isOpen={showMyIssues}
                onClose={() => setShowMyIssues(false)}
            />

            {/* Chat Interface */}
            <ChatBox
                isOpen={showChat}
                onClose={() => setShowChat(false)}
                userName={user?.user_metadata?.full_name || 'User'}
            />
        </div>
    )
}

function FeatureCard({ icon, title, description }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="h-12 w-12 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
                {icon}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>
    )
}
