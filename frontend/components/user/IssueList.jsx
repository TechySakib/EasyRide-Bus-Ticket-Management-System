"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Clock, MessageCircle } from "lucide-react"

export default function IssueList({ refreshTrigger }) {
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchTickets()
    }, [refreshTrigger])

    const fetchTickets = async () => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) return

            const response = await fetch(`http://localhost:5000/api/tickets/user/${session.user.id}`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setTickets(data)
            }
        } catch (err) {
            console.error("Failed to fetch tickets", err)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'open': return 'text-blue-600 bg-blue-50 border-blue-100'
            case 'in_progress': return 'text-orange-600 bg-orange-50 border-orange-100'
            case 'resolved': return 'text-green-600 bg-green-50 border-green-100'
            case 'closed': return 'text-gray-600 bg-gray-50 border-gray-100'
            default: return 'text-gray-600 bg-gray-50 border-gray-100'
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'open': return <AlertCircle className="h-4 w-4" />
            case 'in_progress': return <Clock className="h-4 w-4" />
            case 'resolved': return <CheckCircle2 className="h-4 w-4" />
            default: return <AlertCircle className="h-4 w-4" />
        }
    }

    if (loading) return <div className="text-center py-4 text-gray-500">Loading issues...</div>

    if (tickets.length === 0) {
        return (
            <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500">No issues reported yet.</p>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            {tickets.map((ticket) => (
                <Card key={ticket.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer border-gray-100">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-gray-900">{ticket.issue_title}</span>
                                <span className="text-xs text-gray-400">#{ticket.ticket_number}</span>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2">{ticket.issue_description}</p>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(ticket.status)}`}>
                            {getStatusIcon(ticket.status)}
                            <span className="capitalize">{ticket.status.replace('_', ' ')}</span>
                        </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 text-xs text-gray-400">
                        <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                        {ticket.booking_id && (
                            <span className="bg-gray-100 px-2 py-1 rounded text-gray-500">
                                Linked Booking
                            </span>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    )
}
