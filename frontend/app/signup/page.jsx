"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Bus, Eye, EyeOff, Mail, Lock, User, Phone, IdCard } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"

/**
 * Signup Page Component
 * Allows new users to register for an account.
 * Collects user details including student ID for verification.
 * 
 * @component
 * @returns {JSX.Element} The rendered signup page
 */
export default function SignupPage() {
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        studentId: "",
        password: "",
    })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)


    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                router.push("/dashboard")
            }
        }
        checkUser()
    }, [router])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value })
    }

    const handleSignup = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { data, error } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        full_name: formData.name,
                        phone: formData.phone,
                        student_id: formData.studentId,
                        role: 'passenger',
                    },
                },
            })

            if (error) {
                throw error
            }


            if (data.session) {
                alert("Signup successful! Logging you in...")
                router.push("/dashboard")
            } else {

                alert("Signup successful! Please check your email for verification.")
                router.push("/")
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
            <div className="flex flex-col items-center mb-8">
                <div className="bg-blue-500 p-3 rounded-full mb-4">
                    <Bus className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-blue-600 mb-1">EasyRide</h1>
                <h2 className="text-xl font-semibold text-gray-700">University Bus Service</h2>
                <p className="text-gray-500 mt-1">Create your account</p>
            </div>

            <Card className="w-full max-w-md p-8 shadow-lg">
                <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold text-gray-800">Register</h3>
                </div>

                <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="name"
                                type="text"
                                placeholder=""
                                className="pl-10"
                                value={formData.name}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">University Email</Label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="student@university.edu"
                                className="pl-10"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+1 234 567 8900"
                                className="pl-10"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="studentId">Student ID</Label>
                        <div className="relative">
                            <IdCard className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="studentId"
                                type="text"
                                placeholder="12345678"
                                className="pl-10"
                                value={formData.studentId}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a password"
                                className="pl-10 pr-10"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    {error && (
                        <div className="text-red-500 text-sm text-center">{error}</div>
                    )}

                    <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
                        {loading ? "Creating Account..." : "Register"}
                    </Button>
                </form>

                <div className="mt-6 text-center text-sm">
                    <span className="text-gray-600">Already have an account? </span>
                    <Link href="/" className="text-blue-600 font-semibold hover:underline">
                        Sign In
                    </Link>
                </div>
            </Card>
        </div>
    )
}
