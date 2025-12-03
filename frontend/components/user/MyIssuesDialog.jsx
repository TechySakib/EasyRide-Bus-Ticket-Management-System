"use client"

import { X, MessageSquare } from "lucide-react"
import IssueList from "./IssueList"

export default function MyIssuesDialog({ isOpen, onClose }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 relative flex flex-col max-h-[80vh]">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="h-5 w-5" />
                </button>

                <div className="flex items-center gap-3 mb-6">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">My Issues</h2>
                        <p className="text-sm text-gray-500">Track status of your reported issues</p>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2">
                    <IssueList />
                </div>
            </div>
        </div>
    )
}
