"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, UserPlus, Loader2, Shield, User, Phone, Mail, Lock, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"

/**
 * CreateUserPage component.
 * A page for admins to create new users.
 * Includes a form for user details and role assignment.
 * @returns {JSX.Element} The rendered create user page.
 */
export default function CreateUserPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        studentId: "",
        password: "",
        role: "passenger"
    })

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleRoleChange = (value) => {
        setFormData(prev => ({ ...prev, role: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                throw new Error("Not authenticated")
            }

            const response = await fetch('http://localhost:5000/api/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create user')
            }

            toast({
                title: "Success",
                description: "User created successfully",
            })

            router.push("/dashboard")
        } catch (error) {
            toast({
                title: "Error",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <Button
                    variant="ghost"
                    className="mb-8 hover:bg-transparent hover:text-blue-600 pl-0"
                    onClick={() => router.back()}
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Dashboard
                </Button>

                <Card className="border-0 shadow-xl">
                    <CardHeader className="space-y-1 pb-6 border-b border-gray-100">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <UserPlus className="h-6 w-6" />
                            </div>
                            <span className="font-semibold tracking-wide uppercase text-xs">Admin Access</span>
                        </div>
                        <CardTitle className="text-2xl font-bold">Create New User</CardTitle>
                        <CardDescription>
                            Add a new user to the system and assign their role.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="John Doe"
                                            className="pl-10"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="email"
                                            name="email"
                                            type="email"
                                            placeholder="john@example.com"
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
                                        <Phone className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="phone"
                                            name="phone"
                                            placeholder="+880 1..."
                                            className="pl-10"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="studentId">Student ID (Optional)</Label>
                                    <div className="relative">
                                        <GraduationCap className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="studentId"
                                            name="studentId"
                                            placeholder="202..."
                                            className="pl-10"
                                            value={formData.studentId}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="role">User Role</Label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-2.5 h-5 w-5 text-gray-400 z-10" />
                                        <Select
                                            value={formData.role}
                                            onValueChange={handleRoleChange}
                                        >
                                            <SelectTrigger className="pl-10">
                                                <SelectValue placeholder="Select role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="passenger">Passenger</SelectItem>
                                                <SelectItem value="conductor">Conductor</SelectItem>
                                                <SelectItem value="admin">Admin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Password</Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                                        <Input
                                            id="password"
                                            name="password"
                                            type="password"
                                            placeholder="Min. 6 characters"
                                            className="pl-10"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            minLength={6}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <Button
                                    type="submit"
                                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-600/20 transition-all"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Creating User...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="mr-2 h-5 w-5" />
                                            Create User
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
