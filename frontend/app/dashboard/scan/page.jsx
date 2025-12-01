"use client"

import { useState } from "react"
import QRScanner from "@/components/admin/QRScanner"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function ScanPage() {
    const [validationResult, setValidationResult] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleScan = async (data) => {
        setLoading(true)
        setError(null)
        setValidationResult(null)

        try {
            const response = await fetch("http://localhost:5000/api/tickets/validate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ qr_code_data: data }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.message || "Failed to validate ticket")
            }

            setValidationResult(result)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container mx-auto p-6 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8 text-center">Ticket Scanner</h1>

            <div className="mb-8">
                <QRScanner onScan={handleScan} />
            </div>

            {loading && (
                <div className="flex justify-center items-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Validating ticket...</span>
                </div>
            )}

            {error && (
                <Alert variant="destructive" className="mb-6 bg-red-50 border-red-200">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <AlertTitle className="text-red-800 font-semibold">Invalid Ticket</AlertTitle>
                    <AlertDescription className="text-red-700">
                        {error}
                    </AlertDescription>
                </Alert>
            )}

            {validationResult && (
                <Card className="p-6 bg-green-50 border-green-200">
                    <div className="flex items-start gap-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600 flex-shrink-0" />
                        <div>
                            <h3 className="text-xl font-bold text-green-800 mb-2">Ticket Validated!</h3>
                            <div className="space-y-2 text-green-900">
                                <p><span className="font-semibold">Passenger:</span> {validationResult.passenger_name}</p>
                                <p><span className="font-semibold">Route:</span> {validationResult.route_name}</p>
                                <p><span className="font-semibold">Bus:</span> {validationResult.bus_number}</p>
                                <p><span className="font-semibold">Seat:</span> {validationResult.seat_number}</p>
                                <p><span className="font-semibold">Journey Date:</span> {new Date(validationResult.journey_date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    )
}
