"use client"


import { useState } from "react"
import { useRouter } from "next/navigation"
import DashboardHeader from "@/components/DashboardHeader"
import QRScanner from "@/components/admin/QRScanner"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase"

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

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <DashboardHeader />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-md mx-auto">
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
            </main>
        </div>
    )
}
