"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { X, Search, Filter, AlertCircle, CheckCircle2, Clock, MessageCircle, ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function AdminTicketPanel({ isOpen, onClose }) {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")
    const [filterStatus, setFilterStatus] = useState("all")
    const [searchTerm, setSearchTerm] = useState("")
    const [selectedTicket, setSelectedTicket] = useState(null)
    const [updating, setUpdating] = useState(false)

    useEffect(() => {
        if (isOpen) {
            fetchTickets()
        }
    }, [isOpen])

    const fetchTickets = async () => {
        try {
            setLoading(true)
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const response = await fetch('http://localhost:5000/api/tickets/admin/all', {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setTickets(data)
            } else {
                const text = await response.text()
                console.error('Fetch failed:', response.status, text)
                throw new Error(`Failed to fetch tickets: ${response.status} ${text}`)
            }
        } catch (err) {
            console.error(err)
            setError("Failed to load tickets")
        } finally {
            setLoading(false)
        }
    }

    const handleStatusUpdate = async (ticketId, newStatus) => {
        try {
            setUpdating(true)
            const { data: { session } } = await supabase.auth.getSession()

            const response = await fetch(`http://localhost:5000/api/tickets/${ticketId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({ status: newStatus })
            })

            if (response.ok) {
                // Update local state
                setTickets(tickets.map(t =>
                    t.id === ticketId ? { ...t, status: newStatus } : t
                ))
                if (selectedTicket?.id === ticketId) {
                    setSelectedTicket(prev => ({ ...prev, status: newStatus }))
                }
            }
        } catch (err) {
            console.error(err)
            alert("Failed to update status")
        } finally {
            setUpdating(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-700'
            case 'in_progress': return 'bg-yellow-100 text-yellow-700'
            case 'resolved': return 'bg-green-100 text-green-700'
            case 'closed': return 'bg-gray-100 text-gray-700'
            default: return 'bg-gray-100 text-gray-700'
        }
    }

    const filteredTickets = tickets.filter(ticket => {
        const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus
        const matchesSearch = ticket.ticket_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.issue_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.easyride_users?.email?.toLowerCase().includes(searchTerm.toLowerCase())
        return matchesStatus && matchesSearch
    })

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex overflow-hidden">
                {/* Sidebar List */}
                <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50">
                    <div className="p-4 border-b border-gray-200 bg-white">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-gray-900">Support Tickets</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search tickets..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-sm"
                                />
                            </div>

                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {['all', 'open', 'in_progress', 'resolved', 'closed'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setFilterStatus(status)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${filterStatus === status
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {status.replace('_', ' ').toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {loading ? (
                            <div className="flex justify-center p-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                <p>No tickets found</p>
                            </div>
                        ) : (
                            filteredTickets.map(ticket => (
                                <div
                                    key={ticket.id}
                                    onClick={() => setSelectedTicket(ticket)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all ${selectedTicket?.id === ticket.id
                                        ? 'bg-white shadow-md border-l-4 border-blue-600'
                                        : 'hover:bg-white hover:shadow-sm border border-transparent'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-mono text-gray-500">{ticket.ticket_number}</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${getStatusColor(ticket.status)}`}>
                                            {ticket.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">{ticket.issue_title}</h3>
                                    <p className="text-sm text-gray-500 line-clamp-2 mb-2">{ticket.issue_description}</p>
                                    <div className="flex items-center justify-between text-xs text-gray-400">
                                        <span>{ticket.easyride_users?.name || 'Unknown User'}</span>
                                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex flex-col bg-white h-full overflow-hidden">
                    {selectedTicket ? (
                        <>
                            <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <h1 className="text-2xl font-bold text-gray-900">{selectedTicket.issue_title}</h1>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(selectedTicket.status)}`}>
                                            {selectedTicket.status.replace('_', ' ')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {new Date(selectedTicket.created_at).toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <AlertCircle className="h-4 w-4" />
                                            Priority: {selectedTicket.priority}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <select
                                        value={selectedTicket.status}
                                        onChange={(e) => handleStatusUpdate(selectedTicket.id, e.target.value)}
                                        disabled={updating}
                                        className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="space-y-6">
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                                        <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.issue_description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                            <h3 className="text-sm font-semibold text-gray-900 mb-2">User Details</h3>
                                            <div className="space-y-1 text-sm">
                                                <p><span className="text-gray-500">Name:</span> {selectedTicket.easyride_users?.name}</p>
                                                <p><span className="text-gray-500">Email:</span> {selectedTicket.easyride_users?.email}</p>
                                            </div>
                                        </div>
                                        {selectedTicket.booking_id && (
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Related Booking</h3>
                                                <p className="text-sm text-blue-600">Booking ID: {selectedTicket.booking_id}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Activity Log / Comments could go here */}
                                    <div className="border-t border-gray-100 pt-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-4">Activity Log</h3>
                                        <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <MessageCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p>No comments yet</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <MessageCircle className="h-8 w-8" />
                            </div>
                            <p className="text-lg font-medium text-gray-900">Select a ticket</p>
                            <p className="text-sm">Choose a ticket from the sidebar to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
