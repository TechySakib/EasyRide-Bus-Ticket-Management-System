"use client"

import { useState, useRef, useEffect } from "react"
import { X, Send, Paperclip, Smile } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

/**
 * ChatBox Component
 * 
 * Represents the View in the MVC pattern, displaying the chat interface.
 * The internal state acts as the Model.
 * The event handlers act as the Controller.
 * 
 * @component
 * @param {Object} props
 * @param {boolean} props.isOpen - Controls visibility of the chatbox
 * @param {Function} props.onClose - Callback function to close the chatbox
 * @example
 * return (
 *   <ChatBox isOpen={true} onClose={() => setShowChat(false)} />
 * )
 */
export default function ChatBox({ isOpen, onClose, userName }) {
    // Model: State for messages and input
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: `Hey ${userName}! I'm Sakib Al Hasan. How can I help you today?`,
            sender: "agent",
            timestamp: new Date()
        }
    ])
    const [inputText, setInputText] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const messagesEndRef = useRef(null)

    // Controller: Handle message sending
    const handleSendMessage = async (e) => {
        e.preventDefault()
        if (!inputText.trim()) return

        // Add user message
        const newUserMessage = {
            id: messages.length + 1,
            text: inputText,
            sender: "user",
            timestamp: new Date()
        }

        const updatedMessages = [...messages, newUserMessage]
        setMessages(updatedMessages)
        setInputText("")
        setIsTyping(true)

        try {
            // Get session for auth token
            const { data: { session } } = await supabase.auth.getSession()
            const token = session?.access_token

            if (!token) {
                throw new Error("User not authenticated")
            }

            // Prepare history for API
            const history = updatedMessages.map(msg => ({
                role: msg.sender === 'user' ? 'user' : 'assistant',
                content: msg.text
            })).slice(-10); // Keep last 10 messages for context

            const response = await fetch('http://localhost:5000/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: newUserMessage.text,
                    history: history
                }),
            });

            const data = await response.json();

            if (data.success) {
                setMessages(prev => [...prev, {
                    id: prev.length + 1,
                    text: data.reply,
                    sender: "agent",
                    timestamp: new Date()
                }])
            } else {
                throw new Error(data.message || "Failed to get response")
            }
        } catch (error) {
            console.error("Chat Error:", error)
            setMessages(prev => [...prev, {
                id: prev.length + 1,
                text: "Sorry, I'm having trouble connecting right now. Please try again later.",
                sender: "agent",
                timestamp: new Date()
            }])
        } finally {
            setIsTyping(false)
        }
    }

    // Auto-scroll to bottom
    useEffect(() => {
        if (isOpen) {
            messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
        }
    }, [messages, isOpen, isTyping])

    if (!isOpen) return null

    return (
        <Card className="fixed bottom-24 right-6 w-[380px] h-[600px] shadow-2xl flex flex-col z-50 overflow-hidden border-0 animate-in slide-in-from-bottom-10 fade-in duration-300 rounded-3xl ring-1 ring-black/5 p-0 bg-white/95 backdrop-blur-sm">
            {/* Header */}
            <div className="relative h-24 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-4 flex items-center justify-between text-white overflow-hidden shrink-0">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-xl"></div>

                <div className="flex items-center gap-4 relative z-10">
                    <div className="relative group cursor-pointer">
                        <div className="h-14 w-14 rounded-full border-[3px] border-white/30 overflow-hidden bg-white/10 relative shadow-lg transition-transform group-hover:scale-105">
                            <Image
                                src="/sakib.jpg"
                                alt="Sakib Al Hasan"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="absolute bottom-1 right-1 h-3.5 w-3.5 bg-emerald-400 rounded-full border-[3px] border-indigo-800 animate-pulse shadow-sm"></span>
                    </div>
                    <div>
                        <h3 className="font-bold text-lg tracking-wide">Sakib Al Hasan</h3>
                        <p className="text-xs text-blue-100/90 flex items-center gap-1.5 font-medium">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]"></span>
                            Online Support
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-full transition-all hover:rotate-90 active:scale-95 relative z-10"
                    aria-label="Close chat"
                >
                    <X className="h-6 w-6 text-white/90" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#f8fafc] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                <div className="text-center">
                    <span className="text-[10px] font-medium text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-wider">Today</span>
                </div>

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                    >
                        {msg.sender === 'agent' && (
                            <div className="h-8 w-8 rounded-full overflow-hidden relative flex-shrink-0 mt-1 shadow-sm ring-2 ring-white">
                                <Image
                                    src="/sakib.jpg"
                                    alt="Agent"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        )}

                        <div
                            className={`max-w-[75%] p-4 rounded-2xl text-sm shadow-sm relative group transition-all hover:shadow-md ${msg.sender === 'user'
                                ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-none'
                                : 'bg-white text-gray-700 border border-gray-100/50 rounded-bl-none'
                                }`}
                        >
                            <p className="leading-relaxed">{msg.text}</p>
                            <div className={`text-[10px] mt-2 flex justify-end font-medium ${msg.sender === 'user' ? 'text-blue-100/80' : 'text-gray-400'}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex gap-3 justify-start animate-in fade-in duration-300">
                        <div className="h-8 w-8 rounded-full overflow-hidden relative flex-shrink-0 mt-1 shadow-sm ring-2 ring-white">
                            <Image
                                src="/sakib.jpg"
                                alt="Agent"
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-gray-100/50 shadow-sm flex gap-1.5 items-center h-12 min-w-[60px] justify-center">
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100/50 shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2 items-end bg-gray-50 p-1.5 rounded-[24px] border border-gray-200 focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-100 transition-all shadow-inner">
                    <button type="button" className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-white">
                        <Paperclip className="h-5 w-5" />
                    </button>
                    <Input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder="Type your message..."
                        className="flex-1 bg-transparent border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-2 h-10 text-gray-700 placeholder:text-gray-400"
                    />
                    <button type="button" className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-full hover:bg-white">
                        <Smile className="h-5 w-5" />
                    </button>
                    <Button
                        type="submit"
                        size="icon"
                        className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-600/20 transition-all hover:scale-105 active:scale-95 shrink-0"
                        disabled={!inputText.trim()}
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </form>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-gray-400">Powered by EasyRide AI</p>
                </div>
            </div>
        </Card>
    )
}
