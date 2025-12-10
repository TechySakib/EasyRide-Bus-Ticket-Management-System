"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { X, CheckCircle, XCircle, Clock, Filter, Wallet, Phone, Hash, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RechargeRequestsDialog({ isOpen, onClose }) {
    const [requests, setRequests] = useState([])
    const [filteredRequests, setFilteredRequests] = useState([])
    const [loading, setLoading] = useState(false)
    const [statusFilter, setStatusFilter] = useState('all')
    const [rejectingId, setRejectingId] = useState(null)
    const [rejectionReason, setRejectionReason] = useState('')
    const [processing, setProcessing] = useState(false)

    useEffect(() => {
        if (isOpen) {
            fetchRequests()
        }
    }, [isOpen])

    useEffect(() => {
        if (statusFilter === 'all') {
            setFilteredRequests(requests)
        } else {
            setFilteredRequests(requests.filter(req => req.status === statusFilter))
        }
    }, [statusFilter, requests])

    const fetchRequests = async () => {
        setLoading(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch('http://localhost:5000/api/recharge/all', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const result = await response.json()
            if (result.success) {
                setRequests(result.data)
            }
        } catch (error) {
            console.error('Error fetching requests:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (requestId) => {
        if (!confirm('Are you sure you want to approve this recharge request?')) {
            return
        }

        setProcessing(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch(`http://localhost:5000/api/recharge/approve/${requestId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const result = await response.json()
            if (result.success) {
                await fetchRequests()
                alert('Recharge request approved successfully!')
            } else {
                alert('Failed to approve request: ' + result.error)
            }
        } catch (error) {
            console.error('Error approving request:', error)
            alert('An error occurred while approving the request')
        } finally {
            setProcessing(false)
        }
    }

    const handleReject = async (requestId) => {
        if (!rejectionReason.trim()) {
            alert('Please provide a rejection reason')
            return
        }

        setProcessing(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch(`http://localhost:5000/api/recharge/reject/${requestId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ reason: rejectionReason })
            })

            const result = await response.json()
            if (result.success) {
                await fetchRequests()
                setRejectingId(null)
                setRejectionReason('')
                alert('Recharge request rejected successfully!')
            } else {
                alert('Failed to reject request: ' + result.error)
            }
        } catch (error) {
            console.error('Error rejecting request:', error)
            alert('An error occurred while rejecting the request')
        } finally {
            setProcessing(false)
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return <Clock className="h-5 w-5 text-yellow-600" />
            case 'approved':
                return <CheckCircle className="h-5 w-5 text-green-600" />
            case 'rejected':
                return <XCircle className="h-5 w-5 text-red-600" />
            default:
                return null
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200'
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200'
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200'
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200'
        }
    }

    if (!isOpen) return null

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

            {/* Dialog */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <Wallet className="h-6 w-6 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Recharge Requests</h2>
                                <p className="text-sm text-gray-500">Manage user wallet recharge requests</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="h-6 w-6 text-gray-500" />
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 p-4 border-b border-gray-200 bg-gray-50">
                        {['all', 'pending', 'approved', 'rejected'].map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setStatusFilter(filter)}
                                className={`px-4 py-2 rounded-lg font-medium text-sm transition-all ${statusFilter === filter
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-white text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                                {filter !== 'all' && (
                                    <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                                        {requests.filter(r => r.status === filter).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        ) : filteredRequests.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-gray-500">No {statusFilter !== 'all' ? statusFilter : ''} requests found</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {filteredRequests.map((request) => (
                                    <div key={request.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                {getStatusIcon(request.status)}
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <User className="h-4 w-4 text-gray-400" />
                                                        <span className="font-semibold text-gray-900">
                                                            {request.user?.full_name || 'Unknown User'}
                                                        </span>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                                                        {request.status.toUpperCase()}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-3xl font-bold text-gray-900">৳{parseFloat(request.amount).toFixed(2)}</div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {new Date(request.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div className="space-y-1">
                                                <div className="text-xs text-gray-500">Payment Method</div>
                                                <div className="font-medium text-gray-900">
                                                    {request.payment_method.charAt(0).toUpperCase() + request.payment_method.slice(1)}
                                                </div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Phone className="h-3 w-3" />
                                                    Phone Number
                                                </div>
                                                <div className="font-medium text-gray-900">{request.phone_number}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <Hash className="h-3 w-3" />
                                                    Transaction ID
                                                </div>
                                                <div className="font-medium text-gray-900 text-sm">{request.transaction_id}</div>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="text-xs text-gray-500">User Phone</div>
                                                <div className="font-medium text-gray-900">{request.user?.phone_number || 'N/A'}</div>
                                            </div>
                                        </div>

                                        {request.status === 'rejected' && request.rejection_reason && (
                                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason:</p>
                                                <p className="text-sm text-red-700">{request.rejection_reason}</p>
                                            </div>
                                        )}

                                        {request.status === 'pending' && (
                                            <div className="flex gap-3">
                                                {rejectingId === request.id ? (
                                                    <div className="flex-1 flex gap-2">
                                                        <Input
                                                            placeholder="Enter rejection reason..."
                                                            value={rejectionReason}
                                                            onChange={(e) => setRejectionReason(e.target.value)}
                                                            className="flex-1"
                                                        />
                                                        <Button
                                                            onClick={() => handleReject(request.id)}
                                                            disabled={processing}
                                                            className="bg-red-600 hover:bg-red-700 text-white"
                                                        >
                                                            Confirm
                                                        </Button>
                                                        <Button
                                                            onClick={() => {
                                                                setRejectingId(null)
                                                                setRejectionReason('')
                                                            }}
                                                            variant="outline"
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Button
                                                            onClick={() => handleApprove(request.id)}
                                                            disabled={processing}
                                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                                                        >
                                                            <CheckCircle className="h-4 w-4 mr-2" />
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            onClick={() => setRejectingId(request.id)}
                                                            disabled={processing}
                                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                                                        >
                                                            <XCircle className="h-4 w-4 mr-2" />
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
