"use client"

import { useState } from "react"
import { X, User, Mail, Lock, Phone, UserCog } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { ROLES } from "@/lib/roles"

export default function CreateUserDialog({ isOpen, onClose, onUserCreated }) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: ROLES.PASSENGER
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id || e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                throw new Error('Not authenticated')
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

            
            alert(`User created successfully! Email: ${formData.email}`)

            
            setFormData({
                name: "",
                email: "",
                phone: "",
                password: "",
                role: ROLES.PASSENGER
            })

            
            if (onUserCreated) {
                onUserCreated(data.user)
            }

            
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                {}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg">
                            <UserCog className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">Create New User</h2>
                            <p className="text-sm text-gray-500">Add a new user to the system</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="name"
                                type="text"
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
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="email"
                                type="email"
                                placeholder="user@example.com"
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
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="password"
                                type="password"
                                placeholder="Minimum 6 characters"
                                className="pl-10"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength={6}
                            />
                        </div>
                        <p className="text-xs text-gray-500">Must be at least 6 characters</p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="role">User Role</Label>
                        <div className="relative">
                            <UserCog className="absolute left-3 top-3 h-4 w-4 text-gray-400 z-10" />
                            <Select
                                id="role"
                                name="role"
                                className="pl-10"
                                value={formData.role}
                                onChange={handleChange}
                                required
                            >
                                <option value={ROLES.PASSENGER}>Passenger - Regular user</option>
                                <option value={ROLES.CONDUCTOR}>Conductor - Ticket management</option>
                                <option value={ROLES.ADMIN}>Admin - Full system access</option>
                            </Select>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                        >
                            {loading ? "Creating..." : "Create User"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}


import { supabase } from "@/lib/supabase"
