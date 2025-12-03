"use client"

import { useState } from "react"
import Link from "next/link"
import { Bus, Mail, ArrowRight, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

/**
 * ForgotPasswordPage component.
 * A page for users to request a password reset link.
 * @returns {JSX.Element} The rendered forgot password page.
 */
export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccess(false)

        try {
            const response = await fetch("http://localhost:5000/api/users/forgot-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || "Failed to send reset email")
            }

            setSuccess(true)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-600 shadow-lg mb-4 transform hover:scale-105 transition-transform duration-300">
                        <Bus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">EasyRide</h1>
                    <p className="text-gray-500 mt-2 font-medium">University Shuttle Service</p>
                </div>

                <Card className="border-0 shadow-2xl bg-white/80 backdrop-blur-xl p-8 rounded-2xl">
                    <div className="mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Reset Password</h2>
                        <p className="text-sm text-gray-500 mt-1">Enter your email to receive password reset link</p>
                    </div>

                    {success ? (
                        <div className="space-y-6">
                            <div className="p-4 rounded-lg bg-green-50 border border-green-100 text-green-700 text-sm">
                                <p className="font-medium">Check your email</p>
                                <p className="mt-1">We've sent password reset link to {email}</p>
                            </div>
                            <Link href="/">
                                <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/20 transition-all duration-200">
                                    Return to Login
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="student@university.edu"
                                        className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/20 transition-all duration-200 hover:shadow-blue-600/30 hover:-translate-y-0.5"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Sending...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Send Password Reset Link <ArrowRight className="w-4 h-4" />
                                    </span>
                                )}
                            </Button>
                        </form>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-100 text-center">
                        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors">
                            <ArrowLeft className="w-4 h-4" /> Back to Login
                        </Link>
                    </div>
                </Card>

                <div className="mt-8 text-center">
                    <p className="text-xs text-gray-400">
                        &copy; 2025 EasyRide. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}
