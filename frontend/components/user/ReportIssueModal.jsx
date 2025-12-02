"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, AlertCircle, FileText, Paperclip, CheckCircle2, ChevronRight, ChevronLeft, Upload, Clock, CreditCard, User, Search, HelpCircle, Bus } from "lucide-react"

export default function ReportIssueModal({ isOpen, onClose, onTicketCreated }) {
    const [step, setStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)
    const [bookings, setBookings] = useState([])

    // Form State
    const [issueType, setIssueType] = useState("")
    const [description, setDescription] = useState("")
    const [selectedBooking, setSelectedBooking] = useState("")
    const [files, setFiles] = useState([])

    const ISSUE_TYPES = [
        { id: 'delay', label: 'Delay', icon: Clock },
        { id: 'payment', label: 'Payment Issue', icon: CreditCard },
        { id: 'behaviour', label: 'Driver Behaviour', icon: User },
        { id: 'lost_item', label: 'Lost Item', icon: Search },
        { id: 'bus_quality', label: 'Bus Condition', icon: Bus },
        { id: 'other', label: 'Other', icon: HelpCircle }
    ]

    useEffect(() => {
        if (isOpen) {
            fetchBookings()
            setStep(1)
            setIssueType("")
            setDescription("")
            setSelectedBooking("")
            setFiles([])
            setError("")
            setSuccess(false)
        }
    }, [isOpen])

    const fetchBookings = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const response = await fetch(`http://localhost:5000/api/tickets/user/${session.user.id}/bookings`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setBookings(data)
            }
        } catch (err) {
            console.error("Failed to fetch bookings", err)
        }
    }

    const handleSubmit = async () => {
        setLoading(true)
        setError("")

        try {
            const { data: { session } } = await supabase.auth.getSession()
            console.log('Frontend Session User:', session?.user);
            if (!session) {
                setError("You must be logged in")
                setLoading(false)
                return
            }

            const payload = {
                user_id: session.user.id,
                issue_title: `${issueType.charAt(0).toUpperCase() + issueType.slice(1)} Issue`,
                issue_description: description,
                category: mapIssueTypeToCategory(issueType),
                booking_id: selectedBooking || null
                // attachments would go here if backend supported it
            }

            const response = await fetch('http://localhost:5000/api/tickets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || errorData.details || 'Failed to submit ticket');
            }

            setSuccess(true)
            setTimeout(() => {
                onClose()
                if (onTicketCreated) onTicketCreated()
            }, 2000)

        } catch (err) {
            console.error(err)
            setError(err.message || "Failed to submit ticket. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    const mapIssueTypeToCategory = (type) => {
        const map = {
            'delay': 'other', // or specific if added to enum
            'payment': 'payment',
            'behaviour': 'driver_behavior',
            'lost_item': 'other',
            'bus_quality': 'bus_quality',
            'other': 'other'
        }
        return map[type] || 'other'
    }

    const handleNext = () => {
        if (step === 1 && !issueType) {
            setError("Please select an issue type")
            return
        }
        if (step === 2 && !description) {
            setError("Please provide a description")
            return
        }
        setError("")
        setStep(step + 1)
    }

    const handleBack = () => {
        setError("")
        setStep(step - 1)
    }

    const handleFileChange = (e) => {
        if (e.target.files) {
            setFiles(Array.from(e.target.files))
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative flex flex-col max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Report an Issue</h2>
                    <div className="flex items-center gap-2 mt-2">
                        <div className={`h-2 flex-1 rounded-full ${step >= 1 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        <div className={`h-2 flex-1 rounded-full ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                        <div className={`h-2 flex-1 rounded-full ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`} />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                        Step {step} of 3: {step === 1 ? 'Select Issue Type' : step === 2 ? 'Details' : 'Attachments'}
                    </p>
                </div>

                <div className="flex-1 overflow-y-auto min-h-[300px]">
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4 flex items-center gap-2">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}

                    {success ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-8 w-8 text-green-600" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Ticket Submitted!</h3>
                            <p className="text-gray-500">We have received your report and will get back to you shortly.</p>
                        </div>
                    ) : (
                        <>
                            {step === 1 && (
                                <div className="grid grid-cols-2 gap-4">
                                    {ISSUE_TYPES.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => {
                                                setIssueType(type.id)
                                                setError("")
                                            }}
                                            className={`p-4 rounded-xl border-2 text-left transition-all ${issueType === type.id
                                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                                : 'border-gray-100 hover:border-blue-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${issueType === type.id ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                                                    <type.icon className="h-5 w-5" />
                                                </div>
                                                <span className="font-semibold block">{type.label}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {step === 2 && (
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full min-h-[120px] p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none resize-none"
                                            placeholder="Please describe your issue in detail..."
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700">Link Booking (Optional)</label>
                                        <select
                                            value={selectedBooking}
                                            onChange={(e) => setSelectedBooking(e.target.value)}
                                            className="w-full h-10 px-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none bg-white"
                                        >
                                            <option value="">Select a booking...</option>
                                            {bookings.map((booking) => (
                                                <option key={booking.id} value={booking.id}>
                                                    {booking.booking_reference} - {booking.easyride_bus_assignments?.easyride_routes?.name} ({booking.journey_date})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="space-y-4">
                                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
                                        <input
                                            type="file"
                                            multiple
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                                <Upload className="h-6 w-6 text-blue-600" />
                                            </div>
                                            <p className="font-medium text-gray-900">Click to upload files</p>
                                            <p className="text-sm text-gray-500">or drag and drop images here</p>
                                        </div>
                                    </div>

                                    {files.length > 0 && (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium text-gray-700">Selected Files:</p>
                                            {files.map((file, index) => (
                                                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg text-sm text-gray-600">
                                                    <Paperclip className="h-4 w-4" />
                                                    <span className="truncate">{file.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {!success && (
                    <div className="flex gap-3 pt-6 mt-auto">
                        {step > 1 && (
                            <Button
                                onClick={handleBack}
                                variant="outline"
                                className="flex-1"
                                disabled={loading}
                            >
                                <ChevronLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                        )}
                        {step < 3 ? (
                            <Button
                                onClick={handleNext}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Next
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={loading}
                            >
                                {loading ? "Submitting..." : "Submit Report"}
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
