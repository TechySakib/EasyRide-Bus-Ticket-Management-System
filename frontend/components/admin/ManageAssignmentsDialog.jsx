"use client"

import { useState, useEffect } from "react"
import { X, Loader2, User, Bus, MapPin, Calendar, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export default function ManageAssignmentsDialog({ isOpen, onClose }) {
    const { toast } = useToast()
    const [activeTab, setActiveTab] = useState('buses')
    const [fleetStatus, setFleetStatus] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

    // Assignment Form State
    const [assigningBusId, setAssigningBusId] = useState(null)
    const [locations, setLocations] = useState([])
    const [conductors, setConductors] = useState([])
    const [formData, setFormData] = useState({
        location_id: "",
        conductor_id: "",
        time_slot: ""
    })
    const [submitting, setSubmitting] = useState(false)

    // Define time slots
    const timeSlots = [
        { id: "morning", label: "Morning (08:00 - 10:00)", departure: "08:00", arrival: "10:00" },
        { id: "afternoon", label: "Afternoon (14:00 - 16:00)", departure: "14:00", arrival: "16:00" },
        { id: "evening", label: "Evening (18:00 - 20:00)", departure: "18:00", arrival: "20:00" }
    ]

    useEffect(() => {
        if (isOpen) {
            fetchFleetStatus()
            fetchOptions()
        }
    }, [isOpen, selectedDate])

    const fetchFleetStatus = async () => {
        setLoading(true)
        try {
            console.log('🔍 Fetching fleet status for date:', selectedDate)
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                console.warn('⚠️ No session found')
                return
            }

            const response = await fetch(`http://localhost:5000/api/assignments/fleet-status?date=${selectedDate}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            })

            console.log('📡 Response status:', response.status, response.ok)

            if (response.ok) {
                const data = await response.json()
                console.log('✅ Fleet data received:', data)
                console.log('📊 Number of buses:', data?.length)
                setFleetStatus(data)
            } else {
                const errorText = await response.text()
                console.error('❌ API Error:', response.status, errorText)
            }
        } catch (error) {
            console.error("Failed to fetch fleet status", error)
            toast({
                title: "Error",
                description: "Failed to load fleet status",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    const fetchOptions = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            // Fetch locations
            const { data: locationsData } = await supabase
                .from('locations')
                .select('id, name')
                .order('name')

            if (locationsData) setLocations(locationsData)

            // Fetch conductors via API
            const conductorsRes = await fetch('http://localhost:5000/api/assignments/conductors', {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            })
            if (conductorsRes.ok) {
                const conductorsData = await conductorsRes.json()
                setConductors(conductorsData)
            }

        } catch (error) {
            console.error("Failed to fetch options", error)
        }
    }

    const handleAssignClick = (busId) => {
        setAssigningBusId(busId)
        setFormData({
            location_id: "",
            conductor_id: "",
            time_slot: ""
        })
    }

    const handleCreateAssignment = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()

            // Get selected time slot
            const selectedSlot = timeSlots.find(slot => slot.id === formData.time_slot)
            if (!selectedSlot) {
                toast({
                    title: "Error",
                    description: "Please select a time slot",
                    variant: "destructive"
                })
                setSubmitting(false)
                return
            }

            // Construct payload
            const payload = {
                bus_id: assigningBusId,
                location_id: formData.location_id,
                conductor_id: formData.conductor_id || null,
                assignment_date: selectedDate,
                departure_time: selectedSlot.departure,
                arrival_time: selectedSlot.arrival,
                status: 'scheduled'
            }

            const response = await fetch('http://localhost:5000/api/assignments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) throw new Error('Failed to create assignment')

            toast({
                title: "Success",
                description: "Bus assigned successfully"
            })

            setAssigningBusId(null)
            fetchFleetStatus()
        } catch (error) {
            console.error("Create assignment error", error)
            toast({
                title: "Error",
                description: "Failed to create assignment",
                variant: "destructive"
            })
        } finally {
            setSubmitting(false)
        }
    }

    // Compute conductor status
    const getConductorStatus = () => {
        return conductors.map(conductor => {
            const assignment = fleetStatus.find(item => item.assignment?.conductor_id === conductor.id)?.assignment
            return {
                ...conductor,
                assignment: assignment || null,
                status: assignment ? 'assigned' : 'available'
            }
        })
    }

    const conductorList = getConductorStatus()

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-6 relative flex flex-col max-h-[90vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Manage Assignments</h2>
                        <p className="text-sm text-gray-500">Fleet and Crew scheduling</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex bg-gray-100 p-1 rounded-lg">
                            <button
                                onClick={() => setActiveTab('buses')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'buses' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Buses
                            </button>
                            <button
                                onClick={() => setActiveTab('conductors')}
                                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'conductors' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Conductors
                            </button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-gray-500" />
                            <Input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-40"
                            />
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {activeTab === 'buses' ? (
                                <>
                                    <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 rounded-lg text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <div className="col-span-2">Bus Info</div>
                                        <div className="col-span-3">Route & Crew</div>
                                        <div className="col-span-3">Schedule</div>
                                        <div className="col-span-2">Status</div>
                                        <div className="col-span-2 text-right">Action</div>
                                    </div>

                                    {fleetStatus.map((item) => (
                                        <div key={item.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                                            <div className="grid grid-cols-12 gap-4 items-center">
                                                {/* Bus Info */}
                                                <div className="col-span-2">
                                                    <div className="font-bold text-gray-900">{item.bus_number}</div>
                                                    <div className="text-xs text-gray-500">{item.bus_type}</div>
                                                </div>

                                                {/* Route & Crew */}
                                                <div className="col-span-3">
                                                    {item.assignment ? (
                                                        <div className="space-y-1">
                                                            <div className="text-sm font-medium text-gray-900">{item.assignment.locations?.name || 'Unknown Location'}</div>
                                                            <div className="text-xs text-gray-500 flex flex-col gap-1">
                                                                <div className="flex items-center gap-1 text-blue-600">
                                                                    <User className="h-3 w-3" />
                                                                    Cd: {item.assignment.conductor?.name || 'None'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">-</span>
                                                    )}
                                                </div>

                                                {/* Schedule */}
                                                <div className="col-span-3">
                                                    {item.assignment ? (
                                                        <div className="space-y-1">
                                                            <div className="text-sm text-gray-900 flex items-center gap-1">
                                                                <Clock className="h-3 w-3 text-gray-400" />
                                                                {item.assignment.departure_time?.slice(0, 5)}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                Arrive: {item.assignment.arrival_time?.slice(0, 5)}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">-</span>
                                                    )}
                                                </div>

                                                {/* Status */}
                                                <div className="col-span-2">
                                                    {item.status === 'assigned' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            <AlertCircle className="h-3 w-3" />
                                                            Assigned
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Available
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Action */}
                                                <div className="col-span-2 text-right">
                                                    {item.status === 'available' && (
                                                        <Button
                                                            size="sm"
                                                            variant={assigningBusId === item.id ? "secondary" : "outline"}
                                                            onClick={() => assigningBusId === item.id ? setAssigningBusId(null) : handleAssignClick(item.id)}
                                                            className="h-8"
                                                        >
                                                            {assigningBusId === item.id ? "Cancel" : "Assign"}
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Assignment Form */}
                                            {assigningBusId === item.id && (
                                                <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50/50 rounded-lg p-4">
                                                    <form onSubmit={handleCreateAssignment} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-medium text-gray-500">Location</label>
                                                            <select
                                                                required
                                                                className="w-full h-9 rounded-md border border-gray-200 text-sm"
                                                                value={formData.location_id}
                                                                onChange={(e) => setFormData({ ...formData, location_id: e.target.value })}
                                                            >
                                                                <option value="">Select Location</option>
                                                                {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                                                            </select>
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-xs font-medium text-gray-500">Conductor</label>
                                                            <select
                                                                className="w-full h-9 rounded-md border border-gray-200 text-sm"
                                                                value={formData.conductor_id}
                                                                onChange={(e) => setFormData({ ...formData, conductor_id: e.target.value })}
                                                            >
                                                                <option value="">Select Conductor</option>
                                                                {conductors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                                            </select>
                                                        </div>

                                                        <div className="space-y-1">
                                                            <label className="text-xs font-medium text-gray-500">Time Slot</label>
                                                            <select
                                                                required
                                                                className="w-full h-9 rounded-md border border-gray-200 text-sm"
                                                                value={formData.time_slot}
                                                                onChange={(e) => setFormData({ ...formData, time_slot: e.target.value })}
                                                            >
                                                                <option value="">Select Time Slot</option>
                                                                {timeSlots.map(slot => <option key={slot.id} value={slot.id}>{slot.label}</option>)}
                                                            </select>
                                                        </div>
                                                        <Button type="submit" disabled={submitting} className="h-9 bg-blue-600 hover:bg-blue-700 text-white">
                                                            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Plus className="h-4 w-4 mr-1" /> Assign</>}
                                                        </Button>
                                                    </form>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {fleetStatus.length === 0 && (
                                        <div className="text-center py-12 text-gray-500">
                                            No buses found in the fleet.
                                        </div>
                                    )}
                                </>
                            ) : (
                                <>
                                    <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 rounded-lg text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <div className="col-span-4">Conductor Info</div>
                                        <div className="col-span-4">Current Assignment</div>
                                        <div className="col-span-4 text-right">Status</div>
                                    </div>

                                    {conductorList.map((conductor) => (
                                        <div key={conductor.id} className="border border-gray-100 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                                            <div className="grid grid-cols-12 gap-4 items-center">
                                                <div className="col-span-4">
                                                    <div className="font-bold text-gray-900">{conductor.name}</div>
                                                    <div className="text-xs text-gray-500">{conductor.email}</div>
                                                </div>
                                                <div className="col-span-4">
                                                    {conductor.assignment ? (
                                                        <div className="space-y-1">
                                                            <div className="text-sm font-medium text-gray-900">{conductor.assignment.easyride_routes?.name}</div>
                                                            <div className="text-xs text-gray-500 flex items-center gap-1">
                                                                <Bus className="h-3 w-3" />
                                                                Bus {conductor.assignment.easyride_buses?.bus_number}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm">No assignment for {selectedDate}</span>
                                                    )}
                                                </div>
                                                <div className="col-span-4 text-right">
                                                    {conductor.status === 'assigned' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                            <AlertCircle className="h-3 w-3" />
                                                            Assigned
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                            <CheckCircle className="h-3 w-3" />
                                                            Available
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {conductorList.length === 0 && (
                                        <div className="text-center py-12 text-gray-500">
                                            No conductors found.
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
