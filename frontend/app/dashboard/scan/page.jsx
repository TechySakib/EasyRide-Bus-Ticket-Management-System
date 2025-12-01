"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/components/DashboardHeader"
import QRScanner from "@/components/admin/QRScanner"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getUserRole, ROLES } from "@/lib/roles"

/**
 * Scan Page Component
 * The page for scanning QR codes.
 * 
 * @component
 * @returns {JSX.Element} The rendered scan page
 */
export default function ScanPage() {
    const router = useRouter()
    const [scanResult, setScanResult] = useState(null)
    const [validationStatus, setValidationStatus] = useState(null) // 'success', 'error', 'loading'
    const [ticketDetails, setTicketDetails] = useState(null)
    const [errorMessage, setErrorMessage] = useState("")

    const [bookings, setBookings] = useState([])
    const [loadingBookings, setLoadingBookings] = useState(true)
    const [userRole, setUserRole] = useState(null)
    const [loadingRole, setLoadingRole] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) {
                    setLoadingRole(false)
                    return
                }

                // Fetch role from profiles table for source of truth
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single()

                let role
                if (profile?.role) {
                    role = getUserRole({ user_metadata: { role: profile.role } }) // Normalize profile role
                } else {
                    role = getUserRole(session.user)
                }

                console.log("Current User Role (Normalized):", role) // Debug log
                setUserRole(role)

                // Log access to backend
                fetch('http://localhost:5000/api/users/log-access', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${session.access_token}`
                    }
                }).catch(err => console.error("Error logging access:", err));

                // Fetch bookings only if passenger (student normalizes to passenger)
                if (role === ROLES.PASSENGER) {
                    const response = await fetch('http://localhost:5000/api/tickets/my-bookings', {
                        headers: {
                            'Authorization': `Bearer ${session.access_token}`
                        }
                    })

                    if (response.ok) {
                        const data = await response.json()
                        setBookings(data.bookings || [])
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error)
            } finally {
                setLoadingBookings(false)
                setLoadingRole(false)
            }
        }

        fetchData()
    }, [])

    const handleScan = async (decodedText) => {
        if (validationStatus === 'loading' || validationStatus === 'success') return

        setScanResult(decodedText)
        setValidationStatus('loading')
        setErrorMessage("")

        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                setValidationStatus('error')
                setErrorMessage("You must be logged in to scan tickets.")
                return
            }

            // Call the backend API to validate the ticket
            const response = await fetch('http://localhost:5000/api/tickets/validate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ qrCode: decodedText })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || "Invalid ticket")
            }

            setValidationStatus('success')
            setTicketDetails(data.ticket)

        } catch (error) {
            console.error("Validation error:", error)
            setValidationStatus('error')
            setErrorMessage(error.message || "Failed to validate ticket")
        }
    }

    const resetScanner = () => {
        setScanResult(null)
        setValidationStatus(null)
        setTicketDetails(null)
        setErrorMessage("")
        window.location.reload()
    }

    if (loadingRole) {
        return (
            <div className="min-h-screen bg-slate-50 font-sans flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <DashboardHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Scanner Section - Only for non-passengers (students normalize to passenger) */}
                    {userRole !== ROLES.PASSENGER && (
                        <div className="max-w-md mx-auto w-full">
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-gray-900">Ticket Scanner</h1>
                                <p className="text-gray-500 mt-2">Scan passenger QR codes to validate tickets</p>
                            </div>

                            {!validationStatus && (
                                <QRScanner onScan={handleScan} />
                            )}

                            {validationStatus === 'loading' && (
                                <Card className="p-8 text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-lg font-medium text-gray-900">Validating Ticket...</p>
                                </Card>
                            )}

                            {validationStatus === 'success' && ticketDetails && (
                                <Card className="p-6 bg-green-50 border-green-200">
                                    <div className="text-center mb-6">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                                            <CheckCircle2 className="w-8 h-8 text-green-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-green-700">Valid Ticket</h2>
                                        <p className="text-green-600">Ticket has been successfully verified</p>
                                    </div>

                                    <div className="space-y-4 bg-white p-4 rounded-lg border border-green-100">
                                        <div>
                                            <p className="text-sm text-gray-500">Passenger</p>
                                            <p className="font-semibold text-gray-900">{ticketDetails.passenger_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Route</p>
                                            <p className="font-semibold text-gray-900">{ticketDetails.route_name}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-sm text-gray-500">Date</p>
                                                <p className="font-semibold text-gray-900">
                                                    {new Date(ticketDetails.booking_date).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-500">Time</p>
                                                <p className="font-semibold text-gray-900">
                                                    {ticketDetails.departure_time}
                                                </p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Status</p>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                {ticketDetails.status}
                                            </span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={resetScanner}
                                        className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                                    >
                                        Scan Next Ticket
                                    </button>
                                </Card>
                            )}

                            {validationStatus === 'error' && (
                                <Card className="p-6 bg-red-50 border-red-200">
                                    <div className="text-center mb-6">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                                            <XCircle className="w-8 h-8 text-red-600" />
                                        </div>
                                        <h2 className="text-2xl font-bold text-red-700">Invalid Ticket</h2>
                                        <p className="text-red-600">{errorMessage}</p>
                                    </div>

                                    <button
                                        onClick={resetScanner}
                                        className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                                    >
                                        Try Again
                                    </button>
                                </Card>
                            )}
                        </div>
                    )}

                    {/* Recent Bookings Section - Only for passengers (and students) */}
                    {userRole === ROLES.PASSENGER && (
                        <div className="max-w-md mx-auto w-full">
                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900">Your Recent Bookings</h2>
                                <p className="text-gray-500 mt-2">Quick reference for your trips</p>
                            </div>

                            <div className="space-y-4">
                                {loadingBookings ? (
                                    <div className="text-center py-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                    </div>
                                ) : bookings.length === 0 ? (
                                    <Card className="p-6 text-center text-gray-500">
                                        No recent bookings found.
                                    </Card>
                                ) : (
                                    bookings.map((booking) => (
                                        <Card key={booking.id} className="p-4 hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">
                                                        {booking.easyride_bus_assignments?.easyride_routes?.name || 'Unknown Route'}
                                                    </h3>
                                                    <p className="text-sm text-gray-500">
                                                        Bus: {booking.easyride_bus_assignments?.easyride_buses?.bus_number || 'N/A'}
                                                    </p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${booking.booking_status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                    booking.booking_status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {booking.booking_status.charAt(0).toUpperCase() + booking.booking_status.slice(1)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
                                                <span>{new Date(booking.journey_date).toLocaleDateString()}</span>
                                                <span>Seat: {booking.seat_number}</span>
                                            </div>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
