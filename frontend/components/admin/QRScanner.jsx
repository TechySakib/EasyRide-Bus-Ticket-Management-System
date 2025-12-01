"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"

export default function QRScanner({ onScan, onError }) {
    const [scanResult, setScanResult] = useState(null)
    const scannerRef = useRef(null)

    useEffect(() => {
        // Initialize scanner only once
        if (!scannerRef.current) {
            const scanner = new Html5QrcodeScanner(
                "reader",
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                },
                /* verbose= */ false
            )

            scanner.render(
                (decodedText) => {
                    scanner.clear()
                    setScanResult(decodedText)
                    onScan(decodedText)
                },
                (errorMessage) => {
                    // Ignore errors during scanning (e.g. no QR found in frame)
                    if (onError) onError(errorMessage)
                }
            )

            scannerRef.current = scanner
        }

        return () => {
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear scanner", error)
                })
            }
        }
    }, [onScan, onError])

    const handleReset = () => {
        setScanResult(null)
        window.location.reload() // Simple way to restart scanner for now
    }

    return (
        <Card className="p-6 max-w-md mx-auto bg-white shadow-xl rounded-2xl">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Scan Ticket</h2>
                <p className="text-gray-500 text-sm mt-1">Align the QR code within the frame</p>
            </div>

            {!scanResult ? (
                <div className="overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 relative">
                    <div id="reader" className="w-full h-full"></div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Scan Successful!</h3>
                    <p className="text-gray-500 text-sm break-all px-4 mb-6">{scanResult}</p>
                    <Button onClick={handleReset} className="w-full">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Scan Another
                    </Button>
                </div>
            )}
        </Card>
    )
}
