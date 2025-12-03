"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bus, Lock, Eye, EyeOff, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

/**
 * UpdatePasswordPage component.
 * A page for users to set a new password after clicking a reset link.
 * @returns {JSX.Element} The rendered update password page.
 */
export default function UpdatePasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [session, setSession] = useState(null)

    useEffect(() => {
        // Check for session
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session)
        })

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleUpdatePassword = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setLoading(true)
        setError(null)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            // Password updated successfully, redirect to dashboard or login
            router.push("/dashboard")
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!session) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Card className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Verifying reset link...</p>
                </Card>
            </div>
        )
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
                        <h2 className="text-xl font-semibold text-gray-900">Set New Password</h2>
                        <p className="text-sm text-gray-500 mt-1">Please enter your new password below</p>
                    </div>

                    <form onSubmit={handleUpdatePassword} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700 font-medium">New Password</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pl-10 pr-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">Confirm Password</Label>
                            <div className="relative group">
                                <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                                <Input
                                    id="confirmPassword"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="pl-10 h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all duration-200"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    minLength={6}
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
                                    Updating...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    Update Password <ArrowRight className="w-4 h-4" />
                                </span>
                            )}
                        </Button>
                    </form>
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
