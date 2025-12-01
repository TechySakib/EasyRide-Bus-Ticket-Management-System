"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import {
    MapPin,
    Calendar,
    Search,
    Clock,
    CreditCard,
    BadgePercent,
    CalendarDays,
    MessageCircle,
    HelpCircle
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import DashboardHeader from "@/components/DashboardHeader"
import { isAdmin, getUserRole, getRoleLabel, getRoleColor, ROLES } from "@/lib/roles"
import { logUserRole } from "../actions"

/**
 * Dashboard Page Component
 * The main landing page for authenticated users.
 * Displays booking options, recent activity, and quick access features.
 * 
 * @component
 * @returns {JSX.Element} The rendered dashboard page
 */
export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [userRole, setUserRole] = useState(null)
    const [loading, setLoading] = useState(true)
    const [direction, setDirection] = useState('to_nsu')
    const [locations, setLocations] = useState([])
    const [selectedLocation, setSelectedLocation] = useState("")


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

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <DashboardHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Hero Section */}
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
                        {/* Bus Image */}
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

                {/* Features Section */}
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

            {/* Floating Action Buttons */}
            <div className="fixed bottom-6 right-6 flex items-end gap-2 z-50">
                <button className="bg-black text-white p-2 rounded-full shadow-lg hover:bg-gray-800 transition-colors">
                    <HelpCircle className="h-5 w-5" />
                </button>
                <button className="bg-blue-600 text-white p-4 rounded-full shadow-xl hover:bg-blue-700 transition-transform hover:scale-110">
                    <MessageCircle className="h-6 w-6" />
                </button>
            </div>
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
