"use client"

import { useState } from "react"
import { X, MapPin, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { supabase } from "@/lib/supabase"

export default function CreateRouteDialog({ isOpen, onClose, onRouteCreated }) {
    const [locationName, setLocationName] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")
        setSuccess("")

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                throw new Error("Not authenticated")
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/routes/create-from-location`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ locationName })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.details ? `${data.error}: ${data.details}` : (data.error || 'Failed to create route'))
            }

            setSuccess(`Routes created for ${locationName}`)
            setLocationName("")
            if (onRouteCreated) onRouteCreated(data)

            // Close after a short delay to show success message
            setTimeout(() => {
                onClose()
                setSuccess("")
            }, 1500)

        } catch (err) {
            setError(err.message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Create New Route</h2>
                        <p className="text-sm text-gray-500 mt-1">Add a new destination from Campus</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Location Name</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                <Input
                                    type="text"
                                    placeholder="e.g. Dhanmondi"
                                    value={locationName}
                                    onChange={(e) => setLocationName(e.target.value)}
                                    className="pl-10 h-11"
                                    required
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                This will create routes: Campus → Location and Location → Campus
                            </p>
                        </div>

                        {error && (
                            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="p-3 text-sm text-emerald-600 bg-emerald-50 rounded-lg border border-emerald-100">
                                {success}
                            </div>
                        )}

                        <div className="flex gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                className="flex-1 h-11"
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Route'
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
