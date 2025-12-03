"use client"

import { useEffect, useRef, useState } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react"

/**
 * QR Scanner Component
 * Uses html5-qrcode to scan QR codes from the device camera.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {Function} props.onScan - Callback function called when a QR code is successfully scanned. Receives the decoded text.
 * @param {Function} [props.onError] - Optional callback function called when a scan error occurs.
 * @returns {JSX.Element} The rendered scanner component
 */
export default function QRScanner({ onScan, onError }) {
    const [scanResult, setScanResult] = useState(null)
    const [scanError, setScanError] = useState(null)
    const scannerRef = useRef(null)

    useEffect(() => {
        // Initialize scanner
        const scannerId = "reader";

        // Small delay to ensure DOM is ready
        const timer = setTimeout(() => {
            if (!scannerRef.current) {
                try {
                    const scanner = new Html5QrcodeScanner(
                        scannerId,
                        {
                            fps: 10,
                            qrbox: { width: 250, height: 250 },
                            aspectRatio: 1.0,
                        },
                        /* verbose= */ false
                    )

                    scanner.render(
                        (decodedText) => {
                            console.log("QRScanner scanned:", decodedText);
                            scanner.clear()
                            setScanResult(decodedText)
                            onScan(decodedText)
                        },
                        (errorMessage) => {
                            // Ignore errors during scanning (e.g. no QR found in frame)
                            // Only report critical errors if needed, but usually we ignore frame errors
                        }
                    )

                    scannerRef.current = scanner
                } catch (err) {
                    console.error("Scanner initialization error:", err)
                    setScanError("Failed to access camera. Please ensure permissions are granted.")
                    if (onError) onError(err)
                }
            }
        }, 100);

        return () => {
            clearTimeout(timer)
            if (scannerRef.current) {
                scannerRef.current.clear().catch(error => {
                    console.error("Failed to clear scanner", error)
                })
                scannerRef.current = null
            }
        }
    }, [onScan, onError])

    const handleReset = () => {
        setScanResult(null)
        setScanError(null)
        window.location.reload()
    }

    return (
        <Card className="p-6 max-w-md mx-auto bg-white shadow-xl rounded-2xl">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Scan Ticket</h2>
                <p className="text-gray-500 text-sm mt-1">Align the QR code within the frame</p>
            </div>

            {scanError ? (
                <div className="text-center py-8 bg-red-50 rounded-xl border border-red-100">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                    <p className="text-red-600 font-medium px-4">{scanError}</p>
                    <Button onClick={handleReset} className="mt-4 bg-red-600 hover:bg-red-700">
                        Retry
                    </Button>
                </div>
            ) : !scanResult ? (
                <div className="overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 relative min-h-[300px]">
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
