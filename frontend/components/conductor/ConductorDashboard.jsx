"use client"

import { useState, useEffect } from "react"
import { Bus, Calendar, MapPin, User, Clock, Users } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"

export default function ConductorDashboard({ user }) {
    const [assignments, setAssignments] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                if (!session) return

                const response = await fetch('http://localhost:5000/api/assignments/conductor/my-trips', {
                    headers: { 'Authorization': `Bearer ${session.access_token}` }
                })

                if (response.ok) {
                    const data = await response.json()
                    setAssignments(data)
                }
            } catch (error) {
                console.error("Failed to fetch assignments", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAssignments()
    }, [])

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Conductor Dashboard</h1>
                <p className="text-gray-500 mt-2">Manage your assigned trips and passengers</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {assignments.map((assignment) => (
                    <Card key={assignment.id} className="p-6 hover:shadow-lg transition-shadow border-l-4 border-l-blue-600">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{assignment.easyride_routes?.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                    <Bus className="h-4 w-4" />
                                    <span>Bus {assignment.easyride_buses?.bus_number}</span>
                                </div>
                            </div>
                            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                                UPCOMING
                            </span>
                        </div>

                        <div className="space-y-3 border-t border-gray-100 pt-4">
                            <div className="flex items-center gap-3 text-gray-600">
                                <Calendar className="h-5 w-5 text-gray-400" />
                                <span className="text-sm font-medium">
                                    {new Date(assignment.departure_time).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <Clock className="h-5 w-5 text-gray-400" />
                                <span className="text-sm font-medium">
                                    {new Date(assignment.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-600">
                                <User className="h-5 w-5 text-gray-400" />
                                <span className="text-sm">Driver: {assignment.driver?.name || 'Unassigned'}</span>
                            </div>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                            <div className="flex items-center gap-2 text-gray-500">
                                <Users className="h-4 w-4" />
                                <span className="text-xs">Capacity: {assignment.easyride_buses?.capacity || 'N/A'}</span>
                            </div>
                            <button className="text-blue-600 text-sm font-medium hover:text-blue-700">
                                View Passengers →
                            </button>
                        </div>
                    </Card>
                ))}

                {assignments.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <Bus className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">No Assigned Trips</h3>
                        <p className="text-gray-500">You don't have any upcoming trips assigned yet.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
