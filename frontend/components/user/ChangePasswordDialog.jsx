"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Eye, EyeOff, Lock } from "lucide-react"

/**
 * Change Password Dialog Component
 * a modal form for users to change their password.
 * 
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Controls the visibility of the dialog
 * @param {Function} props.onClose - Callback function to close the dialog
 * @returns {JSX.Element|null} The rendered dialog or null if not open
 */
export default function ChangePasswordDialog({ isOpen, onClose }) {
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess(false)


        if (!currentPassword || !newPassword || !confirmPassword) {
            setError("All fields are required")
            return
        }

        if (newPassword.length < 6) {
            setError("New password must be at least 6 characters")
            return
        }

        if (newPassword !== confirmPassword) {
            setError("New passwords do not match")
            return
        }

        if (currentPassword === newPassword) {
            setError("New password must be different from current password")
            return
        }

        setLoading(true)

        try {

            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                setError("You are not logged in")
                setLoading(false)
                return
            }


            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: session.user.email,
                password: currentPassword
            })

            if (signInError) {
                setError("Current password is incorrect")
                setLoading(false)
                return
            }


            const response = await fetch('http://localhost:5000/api/users/update-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    newPassword
                })
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Failed to update password')
                setLoading(false)
                return
            }

            setSuccess(true)
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")


            setTimeout(() => {
                onClose()
                setSuccess(false)
            }, 2000)

        } catch (err) {
            console.error('Password update error:', err)
            setError('An unexpected error occurred')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setError("")
        setSuccess(false)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
                { }
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                { }
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Lock className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Change Password</h2>
                        <p className="text-sm text-gray-500">Update your account password</p>
                    </div>
                </div>

                { }
                <form onSubmit={handleSubmit} className="space-y-4">
                    { }
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Current Password</label>
                        <div className="relative">
                            <Input
                                type={showCurrentPassword ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="pr-10"
                                placeholder="Enter current password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showCurrentPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    { }
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">New Password</label>
                        <div className="relative">
                            <Input
                                type={showNewPassword ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="pr-10"
                                placeholder="Enter new password (min. 6 characters)"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showNewPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    { }
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Confirm New Password</label>
                        <div className="relative">
                            <Input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="pr-10"
                                placeholder="Confirm new password"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? (
                                    <EyeOff className="h-4 w-4" />
                                ) : (
                                    <Eye className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    { }
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    { }
                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                            Password updated successfully!
                        </div>
                    )}

                    { }
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            onClick={handleClose}
                            variant="outline"
                            className="flex-1"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={loading}
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
