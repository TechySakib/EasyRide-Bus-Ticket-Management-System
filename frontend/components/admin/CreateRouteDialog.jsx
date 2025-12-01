"use client"

import { useState } from "react"
import { X, MapPin, Navigation } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase"

export default function CreateRouteDialog({ isOpen, onClose }) {
    const [locationName, setLocationName] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                throw new Error("Not authenticated")
            }

            const response = await fetch('http://localhost:5000/api/routes/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ locationName })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to create route")
            }

            alert(`Location "${locationName}" created successfully!`)
            setLocationName("")
            onClose()

            // Optional: Refresh locations list if parent component needs it
            // window.location.reload() // or use a callback
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Navigation className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Create New Route</h2>
                            <p className="text-sm text-gray-500">Add a new location and link to campus</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="locationName">Location Name</Label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="locationName"
                                type="text"
                                placeholder="e.g. Mirpur 10"
                                className="pl-10"
                                value={locationName}
                                onChange={(e) => setLocationName(e.target.value)}
                                required
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            This will create a new location and automatically generate routes to/from Campus.
                        </p>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? "Creating..." : "Create Route"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
