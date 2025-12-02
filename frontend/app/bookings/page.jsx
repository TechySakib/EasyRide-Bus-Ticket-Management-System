"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
    Bus,
    Calendar,
    Clock,
    MapPin,
    Search,
    ArrowLeft,
    Filter
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

/**
 * Booking History Page
 * Displays a list of past and upcoming bookings for the user.
 * Allows filtering by date.
 */
export default function BookingsPage() {
    const router = useRouter()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [filterDate, setFilterDate] = useState("")
    const [filteredBookings, setFilteredBookings] = useState([])

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (!session) {
                    router.push("/")
                    return
                }

                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/bookings/history/${session.user.id}`, {
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`
                    }
                })

                if (!response.ok) {
                    throw new Error('Failed to fetch bookings')
                }

                const data = await response.json()
                setBookings(data.bookings)
                setFilteredBookings(data.bookings)
            } catch (error) {
                console.error('Error fetching bookings:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchBookings()
    }, [router])

    useEffect(() => {
        if (filterDate) {
            const filtered = bookings.filter(booking =>
                booking.date === filterDate
            )
            setFilteredBookings(filtered)
        } else {
            setFilteredBookings(bookings)
        }
    }, [filterDate, bookings])

    const getStatusColor = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-700'
            case 'cancelled': return 'bg-red-100 text-red-700'
            case 'completed': return 'bg-blue-100 text-blue-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <ArrowLeft className="h-6 w-6 text-gray-600" />
                            </Link>
                            <div className="flex items-center gap-2">
                                <div className="bg-blue-600 p-1.5 rounded-lg">
                                    <Bus className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xl font-bold text-blue-600">My Bookings</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Booking History</h1>
                        <p className="text-gray-500">View and manage your travel history</p>
                    </div>

                    <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                        <Filter className="h-4 w-4 text-gray-400 ml-2" />
                        <Input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="border-0 focus-visible:ring-0 w-auto"
                            placeholder="Filter by date"
                        />
                        {filterDate && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setFilterDate("")}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {filteredBookings.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="bg-gray-50 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
                        <p className="text-gray-500 mb-6">
                            {filterDate ? "Try selecting a different date" : "You haven't made any bookings yet"}
                        </p>

                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredBookings.map((booking) => (
                            <Card key={booking.id} className="p-6 hover:shadow-md transition-shadow border-gray-100">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-blue-50 p-3 rounded-xl">
                                            <Bus className="h-6 w-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold text-gray-900">{booking.route}</h3>
                                                <Badge className={getStatusColor(booking.status)}>
                                                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-4 w-4" />
                                                    {new Date(booking.date).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="h-4 w-4" />
                                                    {booking.time}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Bus className="h-4 w-4" />
                                                    {booking.busNumber} ({booking.busType})
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between lg:justify-end gap-8 border-t lg:border-t-0 pt-4 lg:pt-0">
                                        <div className="text-left lg:text-right">
                                            <p className="text-sm text-gray-500 mb-1">Seat Number</p>
                                            <p className="font-semibold text-gray-900">{booking.seat}</p>
                                        </div>
                                        <div className="text-left lg:text-right">
                                            <p className="text-sm text-gray-500 mb-1">Amount Paid</p>
                                            <p className="font-semibold text-gray-900">৳{booking.amount}</p>
                                        </div>
                                        <div className="text-left lg:text-right">
                                            <p className="text-sm text-gray-500 mb-1">Booking Ref</p>
                                            <p className="font-mono text-sm font-medium text-gray-600">{booking.reference}</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}
            </main>
        </div>
    )
}
