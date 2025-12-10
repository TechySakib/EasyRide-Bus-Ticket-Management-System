"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowLeft, Wallet, Calendar, CheckCircle, Zap } from "lucide-react"
import Link from "next/link"

export default function SubscriptionsPage() {
    const router = useRouter()
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [walletBalance, setWalletBalance] = useState(0)
    const [subscriptions, setSubscriptions] = useState([])

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push("/")
            } else {
                setUser(session.user)
                await fetchWalletBalance(session.user.id)
                await fetchSubscriptions(session.user.id)
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

    const fetchSubscriptions = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('easyride_plan_subscriptions')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })

            if (!error && data) {
                setSubscriptions(data)
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error)
        }
    }

    const handleRecharge = (amount) => {
        router.push(`/dashboard/recharge?amount=${amount}`)
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        )
    }

    const plans = [
        {
            id: 'daily_round_trip',
            name: 'Daily Round Trip',
            price: 100,
            duration: '1 Day',
            features: [
                'Unlimited trips for 1 day',
                'Round trip coverage',
                'Priority boarding',
                'Valid for 24 hours'
            ],
            color: 'blue'
        },
        {
            id: 'semester',
            name: 'Semester Plan',
            price: 5000,
            duration: '4 Months',
            features: [
                'Unlimited trips for entire semester',
                'Best value for students',
                'Priority support',
                'Transferable (with approval)'
            ],
            color: 'purple',
            popular: true
        }
    ]

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
                {/* Page Title */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
                    <p className="text-lg text-gray-600">Select the perfect subscription plan for your commute</p>
                </div>

                {/* Subscription Plans */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                    {plans.map((plan) => (
                        <Card key={plan.id} className={`relative p-8 shadow-xl border-2 ${plan.popular ? 'border-purple-600' : 'border-gray-200'
                            }`}>
                            {plan.popular && (
                                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                    <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${plan.color}-100 mb-4`}>
                                    {plan.id === 'daily_round_trip' ? (
                                        <Zap className={`h-8 w-8 text-${plan.color}-600`} />
                                    ) : (
                                        <Calendar className={`h-8 w-8 text-${plan.color}-600`} />
                                    )}
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold text-gray-900">৳{plan.price}</span>
                                    <span className="text-gray-600">/ {plan.duration}</span>
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {plan.features.map((feature, index) => (
                                    <li key={index} className="flex items-start gap-3">
                                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        <span className="text-gray-700">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            <Button
                                onClick={() => handleRecharge(plan.price)}
                                className={`w-full h-12 bg-${plan.color}-600 hover:bg-${plan.color}-700 text-white font-semibold ${plan.popular ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                Recharge ৳{plan.price}
                            </Button>
                        </Card>
                    ))}
                </div>

                {/* Active Subscriptions */}
                {subscriptions.length > 0 && (
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Subscriptions</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {subscriptions.map((subscription) => (
                                <Card key={subscription.id} className="p-6 shadow-md border-0">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-lg font-semibold text-gray-900">
                                            {subscription.plan_type === 'daily_round_trip' ? 'Daily Round Trip' : 'Semester Plan'}
                                        </span>
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${subscription.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : subscription.status === 'expired'
                                                    ? 'bg-red-100 text-red-800'
                                                    : 'bg-gray-100 text-gray-800'
                                            }`}>
                                            {subscription.status.toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Start Date:</span>
                                            <span className="font-medium text-gray-900">
                                                {new Date(subscription.start_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">End Date:</span>
                                            <span className="font-medium text-gray-900">
                                                {new Date(subscription.end_date).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}
