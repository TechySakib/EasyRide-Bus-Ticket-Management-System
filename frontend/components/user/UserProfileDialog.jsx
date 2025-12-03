"use client"

import { useState, useEffect } from "react"
import {
    X,
    User,
    Mail,
    Phone,
    Shield,
    Calendar,
    Clock,
    Hash,
    CheckCircle,
    XCircle
} from "lucide-react"
import { supabase } from "@/lib/supabase"
import { getRoleLabel, getRoleColor } from "@/lib/roles"

/**
 * UserProfileDialog component.
 * Displays the profile information of the currently logged-in user.
 * @param {Object} props - The component props.
 * @param {boolean} props.isOpen - Whether the dialog is open.
 * @param {function} props.onClose - Function to close the dialog.
 * @returns {JSX.Element|null} The rendered dialog or null if not open.
 */
export default function UserProfileDialog({ isOpen, onClose }) {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!isOpen) return

            setLoading(true)
            const { data: { session } } = await supabase.auth.getSession()

            if (session) {
                setUser(session.user)
            }
            setLoading(false)
        }

        fetchUserProfile()
    }, [isOpen])

    if (!isOpen) return null

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatDateTime = (dateString) => {
        if (!dateString) return 'Never'
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const roleColor = user ? getRoleColor(user.user_metadata?.role || 'passenger') : 'blue'
    const roleLabel = user ? getRoleLabel(user.user_metadata?.role || 'passenger') : 'Passenger'

    return (
        <>
            { }
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fadeIn"
                onClick={onClose}
            />

            { }
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col pointer-events-auto animate-slideUp overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {loading ? (
                        <div className="flex items-center justify-center p-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : user ? (
                        <>
                            { }
                            <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8 text-white">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="h-6 w-6" />
                                </button>

                                <div className="flex items-center gap-4">
                                    <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-3xl font-bold border-4 border-white/30">
                                        {user.user_metadata?.full_name
                                            ? user.user_metadata.full_name.charAt(0).toUpperCase()
                                            : user.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-bold mb-1">
                                            {user.user_metadata?.full_name || 'User'}
                                        </h2>
                                        <p className="text-blue-100 flex items-center gap-2">
                                            <Mail className="h-4 w-4" />
                                            {user.email}
                                        </p>
                                    </div>
                                </div>

                                { }
                                <div className="mt-4">
                                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-white/20 backdrop-blur-sm border border-white/30">
                                        <Shield className="h-4 w-4" />
                                        {roleLabel}
                                    </span>
                                </div>
                            </div>

                            { }
                            <div className="flex-1 overflow-auto p-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    { }
                                    <InfoSection title="Contact Information">
                                        <InfoItem
                                            icon={<Mail className="h-5 w-5 text-blue-600" />}
                                            label="Email"
                                            value={user.email}
                                        />
                                        <InfoItem
                                            icon={<Phone className="h-5 w-5 text-green-600" />}
                                            label="Phone"
                                            value={user.user_metadata?.phone || 'Not provided'}
                                        />
                                    </InfoSection>

                                    { }
                                    <InfoSection title="Account Information">
                                        <InfoItem
                                            icon={<Hash className="h-5 w-5 text-purple-600" />}
                                            label="User ID"
                                            value={
                                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                                                    {user.id.substring(0, 8)}...
                                                </span>
                                            }
                                        />
                                        <InfoItem
                                            icon={<Shield className="h-5 w-5 text-orange-600" />}
                                            label="Role"
                                            value={
                                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-${roleColor}-100 text-${roleColor}-700`}>
                                                    {roleLabel}
                                                </span>
                                            }
                                        />
                                    </InfoSection>

                                    { }
                                    <InfoSection title="Activity">
                                        <InfoItem
                                            icon={<Calendar className="h-5 w-5 text-indigo-600" />}
                                            label="Account Created"
                                            value={formatDate(user.created_at)}
                                        />
                                        <InfoItem
                                            icon={<Clock className="h-5 w-5 text-emerald-600" />}
                                            label="Last Sign In"
                                            value={formatDateTime(user.last_sign_in_at)}
                                        />
                                    </InfoSection>

                                    { }
                                    <InfoSection title="Status">
                                        <InfoItem
                                            icon={user.email_confirmed_at ?
                                                <CheckCircle className="h-5 w-5 text-green-600" /> :
                                                <XCircle className="h-5 w-5 text-red-600" />
                                            }
                                            label="Email Verified"
                                            value={user.email_confirmed_at ?
                                                <span className="text-green-600 font-semibold">Verified</span> :
                                                <span className="text-red-600 font-semibold">Not Verified</span>
                                            }
                                        />
                                        {user.user_metadata?.student_id && (
                                            <InfoItem
                                                icon={<User className="h-5 w-5 text-blue-600" />}
                                                label="Student ID"
                                                value={user.user_metadata.student_id}
                                            />
                                        )}
                                    </InfoSection>
                                </div>
                            </div>

                            { }
                            <div className="p-6 border-t border-gray-200 bg-gray-50">
                                <div className="flex justify-end">
                                    <button
                                        onClick={onClose}
                                        className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center p-12">
                            <p className="text-gray-500">No user data available</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px) scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
                .animate-slideUp {
                    animation: slideUp 0.3s ease-out;
                }
            `}</style>
        </>
    )
}

/**
 * InfoSection component.
 * Renders a titled section of information items.
 * @param {Object} props - The component props.
 * @param {string} props.title - The section title.
 * @param {React.ReactNode} props.children - The content of the section.
 * @returns {JSX.Element} The rendered section.
 */
function InfoSection({ title, children }) {
    return (
        <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                {title}
            </h3>
            <div className="space-y-3">
                {children}
            </div>
        </div>
    )
}

/**
 * InfoItem component.
 * Renders a single information item with an icon, label, and value.
 * @param {Object} props - The component props.
 * @param {React.ReactNode} props.icon - The icon to display.
 * @param {string} props.label - The label for the information.
 * @param {React.ReactNode} props.value - The value to display.
 * @returns {JSX.Element} The rendered item.
 */
function InfoItem({ icon, label, value }) {
    return (
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="mt-0.5">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-sm font-medium text-gray-900 break-words">
                    {value}
                </p>
            </div>
        </div>
    )
}
