"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Wallet, CreditCard, Phone, Hash, CheckCircle, Clock, XCircle } from "lucide-react"
import Link from "next/link"

export default function RechargePage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [walletBalance, setWalletBalance] = useState(0)
    const [requests, setRequests] = useState([])

    // Form state
    const [amount, setAmount] = useState(searchParams.get('amount') || '')
    const [paymentMethod, setPaymentMethod] = useState('bkash')
    const [phoneNumber, setPhoneNumber] = useState('')
    const [transactionId, setTransactionId] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push("/")
            } else {
                setUser(session.user)
                await fetchWalletBalance(session.user.id)
                await fetchMyRequests(session.user.id)
            }
            setLoading(false)
        }
        checkUser()
    }, [router])

    const fetchWalletBalance = async (userId) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch('http://localhost:5000/api/recharge/wallet/balance', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })

            const result = await response.json()
            if (result.success) {
                setWalletBalance(result.balance)
            }
        } catch (error) {
            console.error('Error fetching wallet balance:', error)
        }
    }

    const fetchMyRequests = async (userId) => {
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch('http://localhost:5000/api/recharge/my-requests', {
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
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setSuccess(false)
        setSubmitting(true)

        // Validation
        if (!amount || !phoneNumber || !transactionId) {
            setError('All fields are required')
            setSubmitting(false)
            return
        }

        if (parseFloat(amount) <= 0) {
            setError('Amount must be greater than 0')
            setSubmitting(false)
            return
        }

        try {
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            const response = await fetch('http://localhost:5000/api/recharge/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    paymentMethod,
                    phoneNumber,
                    transactionId
                })
            })

            const result = await response.json()

            if (result.success) {
                setSuccess(true)
                setAmount('')
                setPhoneNumber('')
                setTransactionId('')
                await fetchMyRequests(user.id)
            } else {
                setError(result.error || 'Failed to submit recharge request')
            }
        } catch (error) {
            console.error('Error submitting request:', error)
            setError('An error occurred. Please try again.')
        } finally {
            setSubmitting(false)
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
                            <ArrowLeft className="h-5 w-5" />
                            <span className="font-medium">Back to Dashboard</span>
                        </Link>
                        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg">
                            <Wallet className="h-5 w-5 text-blue-600" />
                            <span className="text-sm font-medium text-gray-600">Balance:</span>
                            <span className="text-lg font-bold text-blue-600">৳{walletBalance.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recharge Form */}
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Recharge Wallet</h1>
                        <p className="text-gray-600 mb-6">Submit a recharge request for admin approval</p>

                        <Card className="p-6 shadow-lg border-0">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Amount */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Amount (৳)</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input
                                            type="number"
                                            step="0.01"
                                            min="1"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            className="pl-10 h-12"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Payment Method */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Payment Method</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {['bkash', 'nagad', 'rocket'].map((method) => (
                                            <button
                                                key={method}
                                                type="button"
                                                onClick={() => setPaymentMethod(method)}
                                                className={`px-4 py-3 rounded-lg border-2 font-medium transition-all ${paymentMethod === method
                                                        ? 'border-blue-600 bg-blue-50 text-blue-600'
                                                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                {method.charAt(0).toUpperCase() + method.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Phone Number */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input
                                            type="tel"
                                            value={phoneNumber}
                                            onChange={(e) => setPhoneNumber(e.target.value)}
                                            placeholder="01XXXXXXXXX"
                                            className="pl-10 h-12"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Transaction ID */}
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700">Transaction ID</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                                        <Input
                                            type="text"
                                            value={transactionId}
                                            onChange={(e) => setTransactionId(e.target.value)}
                                            placeholder="Enter transaction ID"
                                            className="pl-10 h-12"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                        {error}
                                    </div>
                                )}

                                {/* Success Message */}
                                {success && (
                                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                                        Recharge request submitted successfully! Please wait for admin approval.
                                    </div>
                                )}

                                {/* Submit Button */}
                                <Button
                                    type="submit"
                                    disabled={submitting}
                                    className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                                >
                                    {submitting ? 'Submitting...' : 'Submit Request'}
                                </Button>
                            </form>
                        </Card>
                    </div>

                    {/* Request History */}
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Request History</h2>
                        <div className="space-y-4">
                            {requests.length === 0 ? (
                                <Card className="p-8 text-center">
                                    <p className="text-gray-500">No recharge requests yet</p>
                                </Card>
                            ) : (
                                requests.map((request) => (
                                    <Card key={request.id} className="p-4 shadow-md border-0">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                {getStatusIcon(request.status)}
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                                                    {request.status.toUpperCase()}
                                                </span>
                                            </div>
                                            <span className="text-2xl font-bold text-gray-900">৳{parseFloat(request.amount).toFixed(2)}</span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Payment Method:</span>
                                                <span className="font-medium text-gray-900">
                                                    {request.payment_method.charAt(0).toUpperCase() + request.payment_method.slice(1)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Phone:</span>
                                                <span className="font-medium text-gray-900">{request.phone_number}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Transaction ID:</span>
                                                <span className="font-medium text-gray-900">{request.transaction_id}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Submitted:</span>
                                                <span className="font-medium text-gray-900">
                                                    {new Date(request.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {request.status === 'rejected' && request.rejection_reason && (
                                                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                                                    <p className="text-xs font-medium text-red-800 mb-1">Rejection Reason:</p>
                                                    <p className="text-sm text-red-700">{request.rejection_reason}</p>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
