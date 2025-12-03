# EasyRide AI Chatbot

## Achieved Milestones
- **Database setup**: Supabase(sql) integration for user data.
- **QR Code Feature**: QR code generation for bookings and scanner for ticket validation.
- **Role Based Access Control**: Only the passenger role can generate QR code and other roles can scan QR code.

This branch (`chatbot`) implements a smart, context-aware AI assistant for the EasyRide Bus Ticket Management System.

## Features

### 🤖 Intelligent Agent
- **Persona**: "Sakib Al Hasan" - a helpful and professional support agent.
- **Context-Aware**: Knows the logged-in user's name, role, and booking history.
- **Realtime**: Powered by OpenAI's Realtime API over WebSockets for instant responses.

### 🛠️ Capabilities
The chatbot can perform actions on behalf of the user:
1.  **Create Support Tickets**:
    - Automatically infers ticket title and priority from the conversation.
    - Provides empathetic responses and confirmation numbers.
2.  **Search Trips**: Finds active bus routes based on origin, destination, and date.
3.  **Book Trips**: Can book a seat directly through the chat interface.

### 💻 Technical Implementation
- **Frontend**: Next.js component (`ChatBox.jsx`) with a modern, glassmorphism design.
- **Backend**: Node.js/Express controller (`chatController.js`) managing WebSocket connections.
- **Database**: Supabase integration for fetching user data and executing actions.
- **Documentation**: Full JSDoc coverage for all JavaScript files.


## Usage

1.  Log in to the **Dashboard**.
2.  Click the **Chat Icon** in the bottom-right corner.
3.  Start chatting! Try asking:
    - *"I want to book a bus to campus for tomorrow."*
    - *"I lost my bag on the last trip, please help."*
