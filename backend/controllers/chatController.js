const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

/**
 * Chat Controller
 * Handles interactions with the OpenAI Realtime API via WebSockets.
 * Manages user context (bookings, tickets, locations) and tool execution.
 */

/**
 * Establishes a WebSocket connection with OpenAI Realtime API and manages the chat session.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.message - User's message
 * @param {Object} req.user - Authenticated user object
 * @param {string} req.user.id - User ID
 * @param {string} req.user.email - User Email
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Sends JSON response with chat reply or error
 */
exports.chatWithAgent = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id; // From authMiddleware

        // 1. Fetch User Profile
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (profileError) console.error('Error fetching profile:', profileError);

        // 2. Fetch User Bookings (Last 5)
        const { data: bookings, error: bookingsError } = await supabase
            .from('easyride_bookings')
            .select(`
                id,
                booking_reference,
                booking_status,
                journey_date,
                pickup:pickup_location_id(name),
                dropoff:dropoff_location_id(name),
                seat_number,
                amount_paid
            `)
            .eq('passenger_id', userId)
            .order('created_at', { ascending: false })
            .limit(5);

        if (bookingsError) console.error('Error fetching bookings:', bookingsError);

        // 3. Fetch Locations
        const { data: locations, error: locationsError } = await supabase
            .from('locations')
            .select('id, name');

        if (locationsError) console.error('Error fetching locations:', locationsError);

        // 4. Fetch Active Support Tickets
        // Note: easyride_support_tickets uses bigint user_id, but we have UUID. 
        // We might need to map it, but for reading, we rely on what we can find.
        // If we can't map, we might not find tickets created by this user if the ID types don't match.
        // For now, let's try to find tickets where user_id matches the easyride_users id if possible.

        let tickets = [];
        // Lookup easyride_users id first
        const { data: easyRideUser } = await supabase
            .from('easyride_users')
            .select('id')
            .eq('email', req.user.email)
            .single();

        if (easyRideUser) {
            const { data: foundTickets, error: ticketsError } = await supabase
                .from('easyride_support_tickets')
                .select('ticket_number, issue_title, status, priority, created_at')
                .eq('user_id', easyRideUser.id)
                .neq('status', 'resolved')
                .order('created_at', { ascending: false });

            if (ticketsError) console.error('Error fetching tickets:', ticketsError);
            tickets = foundTickets || [];
        }

        // 5. Construct System Instruction
        const userName = profile?.full_name || 'User';
        const userRole = profile?.role || 'passenger';

        let contextString = `Current User: ${userName} (Role: ${userRole}, ID: ${userId})\n`;

        if (bookings && bookings.length > 0) {
            contextString += "Recent Bookings:\n";
            bookings.forEach(b => {
                contextString += `- Ref: ${b.booking_reference}, Status: ${b.booking_status}, Date: ${b.journey_date}, Route: ${b.pickup?.name} to ${b.dropoff?.name}, Seat: ${b.seat_number}\n`;
            });
        } else {
            contextString += "Recent Bookings: None\n";
        }

        if (tickets && tickets.length > 0) {
            contextString += "Active Support Tickets:\n";
            tickets.forEach(t => {
                contextString += `- Ticket #${t.ticket_number}: ${t.issue_title} (Status: ${t.status}, Priority: ${t.priority})\n`;
            });
        } else {
            contextString += "Active Support Tickets: None\n";
        }

        if (locations && locations.length > 0) {
            contextString += `Available Locations: ${locations.map(l => l.name).join(', ')}\n`;
        }

        const systemInstruction = `
You are Sakib Al Hasan, a helpful support agent for EasyRide Bus Ticket Management System (a shuttle service for NSU Students).
You are polite, professional, and concise.

CONTEXT:
${contextString}

RESTRICTIONS & BEHAVIOR:
1. You must ONLY discuss EasyRide bus services, bookings, routes, support tickets, and related topics.
2. If the user asks about general knowledge, politely refuse.
3. **Ticket Creation**:
    - **Do NOT ask** the user for a title or priority.
    - **Infer** a concise, professional title from their description.
    - **Infer** the priority (High for safety/urgent, Medium for standard, Low for minor).
    - If the user explicitly states a priority, use it.
    - **Empathetic Response**: After creating a ticket, respond with empathy specific to the issue.
        - *Example (Safety)*: "I am deeply sorry to hear about this. Passenger safety is our top priority..."
        - *Example (Tech)*: "I apologize for the inconvenience..."
    - **Confirmation**: You MUST explicitly confirm the ticket creation using the phrase "**I have successfully created**..." and provide the **Ticket Number** in the **SAME** message as your empathetic response.
4. **Language**: You must **ALWAYS** reply in **English**, even if the user speaks Bengali, Banglish, or any other language.
5. You have access to the CURRENT USER'S bookings and support tickets.
6. You DO NOT have access to other users' data.
`;

        // 6. Call OpenAI Realtime API
        const url = "wss://api.openai.com/v1/realtime?model=gpt-4o-mini-realtime-preview-2024-12-17";

        const ws = new WebSocket(url, {
            headers: {
                "Authorization": "Bearer " + process.env.OPENAI_API_KEY,
                "OpenAI-Beta": "realtime=v1",
            },
        });

        let responseSent = false;

        // Tool Definitions
        const tools = [
            {
                type: "function",
                name: "create_ticket",
                description: "Create a new support ticket. Infer title and priority from description if not provided.",
                parameters: {
                    type: "object",
                    properties: {
                        title: { type: "string", description: "Inferred brief title of the issue" },
                        description: { type: "string", description: "Detailed description of the issue" },
                        priority: { type: "string", enum: ["low", "medium", "high"], description: "Inferred priority level" }
                    },
                    required: ["title", "description", "priority"]
                }
            },
            {
                type: "function",
                name: "search_trips",
                description: "Search for available bus trips.",
                parameters: {
                    type: "object",
                    properties: {
                        origin: { type: "string", description: "Departure location name" },
                        destination: { type: "string", description: "Arrival location name" },
                        date: { type: "string", description: "Date of travel (YYYY-MM-DD)" }
                    },
                    required: ["origin", "destination", "date"]
                }
            },
            {
                type: "function",
                name: "book_trip",
                description: "Book a specific bus trip for the user.",
                parameters: {
                    type: "object",
                    properties: {
                        bus_assignment_id: { type: "integer", description: "ID of the bus assignment to book" },
                        seat_number: { type: "integer", description: "Seat number to book" }
                    },
                    required: ["bus_assignment_id", "seat_number"]
                }
            }
        ];

        ws.on("open", function open() {
            // 1. Configure Session with Tools
            ws.send(JSON.stringify({
                type: "session.update",
                session: {
                    modalities: ["text"],
                    instructions: systemInstruction,
                    tools: tools,
                    tool_choice: "auto"
                }
            }));

            // 2. Send user message
            ws.send(JSON.stringify({
                type: "conversation.item.create",
                item: {
                    type: "message",
                    role: "user",
                    content: [
                        {
                            type: "input_text",
                            text: message
                        }
                    ]
                }
            }));

            // 3. Request a response
            ws.send(JSON.stringify({
                type: "response.create"
            }));
        });

        ws.on("message", async function incoming(data) {
            const event = JSON.parse(data.toString());

            if (event.type === "response.text.done") {
                // Wait for final response
            }
            else if (event.type === "response.done") {
                const output = event.response.output[0];
                if (output && output.type === "message" && output.content && output.content[0].type === "text") {
                    if (!responseSent) {
                        res.status(200).json({
                            success: true,
                            reply: output.content[0].text
                        });
                        responseSent = true;
                        ws.close();
                    }
                }
            }
            else if (event.type === "response.function_call_arguments.done") {
                const { name, arguments: args, call_id } = event;
                const parsedArgs = JSON.parse(args);
                let result = { error: "Unknown tool" };

                console.log(`Executing tool: ${name} with args:`, parsedArgs);

                try {
                    if (name === "create_ticket") {
                        // Lookup easyride_users id by email (since ticket table uses bigint)
                        const { data: easyRideUser } = await supabase
                            .from('easyride_users')
                            .select('id')
                            .eq('email', req.user.email)
                            .single();

                        const ticketUserId = easyRideUser ? easyRideUser.id : null;
                        let finalDescription = parsedArgs.description;

                        if (!ticketUserId) {
                            finalDescription += `\n\n[System Note: User UUID: ${userId}]`;
                        }

                        const { data, error } = await supabase
                            .from('easyride_support_tickets')
                            .insert([{
                                user_id: ticketUserId,
                                issue_title: parsedArgs.title,
                                issue_description: finalDescription,
                                priority: parsedArgs.priority,
                                status: 'open',
                                ticket_number: `TKT-${Date.now().toString().slice(-6)}`
                            }])
                            .select()
                            .single();

                        if (error) throw error;
                        result = { success: true, ticket: data, message: `Ticket #${data.ticket_number} created successfully.` };
                    }
                    else if (name === "search_trips") {
                        // 1. Find Location IDs
                        const { data: locs } = await supabase.from('locations').select('id, name');
                        const originId = locs.find(l => l.name.toLowerCase() === parsedArgs.origin.toLowerCase())?.id;
                        const destId = locs.find(l => l.name.toLowerCase() === parsedArgs.destination.toLowerCase())?.id;

                        if (!originId || !destId) {
                            result = { success: false, message: "Locations not found." };
                        } else {
                            // 2. Find Routes
                            const { data: routes } = await supabase.from('easyride_routes').select('id').eq('origin_id', originId).eq('destination_id', destId);
                            const routeIds = routes.map(r => r.id);

                            if (routeIds.length === 0) {
                                result = { success: false, message: "No routes found between these locations." };
                            } else {
                                // 3. Find Assignments
                                const { data: trips } = await supabase
                                    .from('easyride_bus_assignments')
                                    .select('id, departure_time, arrival_time, bus_id, status')
                                    .in('route_id', routeIds)
                                    .eq('assignment_date', parsedArgs.date)
                                    .eq('status', 'scheduled');

                                result = { success: true, trips: trips || [] };
                            }
                        }
                    }
                    else if (name === "book_trip") {
                        const { data, error } = await supabase
                            .from('easyride_bookings')
                            .insert([{
                                bus_assignment_id: parsedArgs.bus_assignment_id,
                                passenger_id: userId,
                                seat_number: parsedArgs.seat_number,
                                booking_reference: `BK-${Date.now().toString().slice(-6)}`,
                                booking_status: 'confirmed',
                                payment_status: 'pending'
                            }])
                            .select()
                            .single();

                        if (error) throw error;
                        result = { success: true, booking: data, message: `Booking ${data.booking_reference} confirmed!` };
                    }
                } catch (err) {
                    console.error("Tool Execution Error:", err);
                    result = { success: false, error: err.message };
                }

                // Send Tool Output
                ws.send(JSON.stringify({
                    type: "conversation.item.create",
                    item: {
                        type: "function_call_output",
                        call_id: call_id,
                        output: JSON.stringify(result)
                    }
                }));

                // Request Follow-up Response
                ws.send(JSON.stringify({
                    type: "response.create"
                }));
            }
            else if (event.type === "error") {
                console.error("Realtime API Error Event:", event);
                if (!responseSent) {
                    res.status(500).json({
                        success: false,
                        message: "Realtime API Error",
                        error: event.error
                    });
                    responseSent = true;
                    ws.close();
                }
            }
        });

        ws.on("error", function error(err) {
            console.error("WebSocket Error:", err);
            if (!responseSent) {
                res.status(500).json({
                    success: false,
                    message: "WebSocket connection failed",
                    error: err.message
                });
                responseSent = true;
            }
        });

    } catch (error) {
        console.error("Controller Error:", error);
        res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};
